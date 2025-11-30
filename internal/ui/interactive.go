package ui

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/bubbles/key"
	"github.com/charmbracelet/bubbles/list"
	"github.com/charmbracelet/bubbles/progress"
	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/dso-cli/dso-cli/internal/llm"
	"github.com/dso-cli/dso-cli/internal/scanner"
)

var (
	docStyle = lipgloss.NewStyle().Margin(1, 2)
	helpStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("241")).Margin(1, 0)
	statusMessageStyle = lipgloss.NewStyle().
		Foreground(lipgloss.Color("86")).
		Background(lipgloss.Color("235")).
		Padding(0, 1)
)

type model struct {
	analysis     *llm.AnalysisResult
	results      *scanner.ScanResults
	currentTab   int
	tabs         []string
	list         list.Model
	viewport     viewport.Model
	progress     progress.Model
	width        int
	height       int
	ready        bool
	showProgress bool
}

type item struct {
	title       string
	description string
	severity    scanner.Severity
	file        string
	line        int
}

func (i item) FilterValue() string { return i.title }

func (i item) Title() string {
	severityStyle := lowStyle
	switch i.severity {
	case scanner.SeverityCritical:
		severityStyle = criticalStyle
	case scanner.SeverityHigh:
		severityStyle = highStyle
	case scanner.SeverityMedium:
		severityStyle = mediumStyle
	}
	if i.severity != "" {
		return severityStyle.Render(i.title)
	}
	return i.title
}

func (i item) Description() string {
	desc := i.description
	if i.file != "" {
		desc += "\n📁 " + i.file
		if i.line > 0 {
			desc += fmt.Sprintf(":%d", i.line)
		}
	}
	return desc
}

type keyMap struct {
	Quit    key.Binding
	NextTab key.Binding
	PrevTab key.Binding
	Up      key.Binding
	Down    key.Binding
	Enter   key.Binding
	Back    key.Binding
}

func newKeyMap() keyMap {
	return keyMap{
		Quit: key.NewBinding(
			key.WithKeys("q", "ctrl+c"),
			key.WithHelp("q/ctrl+c", "quit"),
		),
		NextTab: key.NewBinding(
			key.WithKeys("tab", "right"),
			key.WithHelp("tab/→", "next tab"),
		),
		PrevTab: key.NewBinding(
			key.WithKeys("shift+tab", "left"),
			key.WithHelp("shift+tab/←", "previous tab"),
		),
		Up: key.NewBinding(
			key.WithKeys("up", "k"),
			key.WithHelp("↑/k", "move up"),
		),
		Down: key.NewBinding(
			key.WithKeys("down", "j"),
			key.WithHelp("↓/j", "move down"),
		),
		Enter: key.NewBinding(
			key.WithKeys("enter"),
			key.WithHelp("enter", "select"),
		),
		Back: key.NewBinding(
			key.WithKeys("esc"),
			key.WithHelp("esc", "back"),
		),
	}
}

func (m model) Init() tea.Cmd {
	return nil
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
		m.ready = true
		m.viewport.Width = msg.Width - 4
		m.viewport.Height = msg.Height - 10
		m.list.SetWidth(msg.Width - 4)
		m.list.SetHeight(msg.Height - 10)
		return m, nil

	case tea.KeyMsg:
		switch {
		case key.Matches(msg, m.keys().Quit):
			return m, tea.Quit
		case key.Matches(msg, m.keys().NextTab):
			m.currentTab = (m.currentTab + 1) % len(m.tabs)
			m.updateList()
			return m, nil
		case key.Matches(msg, m.keys().PrevTab):
			m.currentTab = (m.currentTab - 1 + len(m.tabs)) % len(m.tabs)
			m.updateList()
			return m, nil
		}
	}

	var cmd tea.Cmd
	m.list, cmd = m.list.Update(msg)
	return m, cmd
}

func (m model) View() string {
	if !m.ready {
		return "Initializing..."
	}

	var b strings.Builder

	// Header
	b.WriteString(m.renderHeader())
	b.WriteString("\n\n")

	// Tabs
	b.WriteString(m.renderTabs())
	b.WriteString("\n\n")

	// Content
	b.WriteString(m.renderContent())
	b.WriteString("\n\n")

	// Footer
	b.WriteString(m.renderFooter())

	return docStyle.Render(b.String())
}

func (m model) renderHeader() string {
	header := lipgloss.NewStyle().
		Bold(true).
		Foreground(lipgloss.Color("1")).
		Padding(0, 1).
		Render("🔒 DSO - DevSecOps Oracle")

	stats := fmt.Sprintf("Total: %d | Critical: %d | High: %d | Medium: %d | Low: %d",
		m.results.Summary.Total,
		m.results.Summary.Critical,
		m.results.Summary.High,
		m.results.Summary.Medium,
		m.results.Summary.Low)

	statsStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color("241")).
		MarginLeft(2)

	return lipgloss.JoinHorizontal(lipgloss.Left, header, statsStyle.Render(stats))
}

func (m model) renderTabs() string {
	var tabs []string
	for i, tab := range m.tabs {
		style := lipgloss.NewStyle().
			Padding(0, 2).
			MarginRight(1)

		if i == m.currentTab {
			style = style.
				Bold(true).
				Foreground(lipgloss.Color("1")).
				Background(lipgloss.Color("235")).
				Border(lipgloss.RoundedBorder()).
				BorderForeground(lipgloss.Color("1"))
		} else {
			style = style.
				Foreground(lipgloss.Color("241"))
		}

		tabs = append(tabs, style.Render(tab))
	}

	return lipgloss.JoinHorizontal(lipgloss.Left, tabs...)
}

func (m model) renderContent() string {
	switch m.currentTab {
	case 0: // Summary
		return m.renderSummary()
	case 1: // Top Fixes
		return m.list.View()
	case 2: // Critical
		return m.list.View()
	case 3: // High
		return m.list.View()
	case 4: // All Findings
		return m.list.View()
	default:
		return "Unknown tab"
	}
}

func (m model) renderSummary() string {
	var b strings.Builder

	// AI Summary
	if m.analysis != nil && m.analysis.Summary != "" {
		b.WriteString(successStyle.Render("📊 AI Summary"))
		b.WriteString("\n")
		b.WriteString(strings.Repeat("─", m.width-4))
		b.WriteString("\n")
		b.WriteString("  " + m.analysis.Summary)
		b.WriteString("\n\n")
	}

	// Statistics
	b.WriteString(infoStyle.Render("📈 Statistics"))
	b.WriteString("\n")
	b.WriteString(strings.Repeat("─", m.width-4))
	b.WriteString("\n")

	// Progress bars for severity
	b.WriteString(m.renderSeverityBar("Critical", m.results.Summary.Critical, m.results.Summary.Total, criticalStyle))
	b.WriteString("\n")
	b.WriteString(m.renderSeverityBar("High", m.results.Summary.High, m.results.Summary.Total, highStyle))
	b.WriteString("\n")
	b.WriteString(m.renderSeverityBar("Medium", m.results.Summary.Medium, m.results.Summary.Total, mediumStyle))
	b.WriteString("\n")
	b.WriteString(m.renderSeverityBar("Low", m.results.Summary.Low, m.results.Summary.Total, lowStyle))
	b.WriteString("\n\n")

	// Business Impact
	if m.analysis != nil && m.analysis.BusinessImpact != "" {
		b.WriteString(infoStyle.Render("💼 Business Impact"))
		b.WriteString("\n")
		b.WriteString(strings.Repeat("─", m.width-4))
		b.WriteString("\n")
		b.WriteString("  " + m.analysis.BusinessImpact)
		b.WriteString("\n\n")
	}

	return b.String()
}

func (m model) renderSeverityBar(label string, count, total int, style lipgloss.Style) string {
	percentage := 0.0
	if total > 0 {
		percentage = float64(count) / float64(total)
	}

	bar := m.progress.ViewAs(percentage)
	labelText := fmt.Sprintf("%s: %d", label, count)

	return fmt.Sprintf("  %s %s", style.Render(labelText), bar)
}

func (m model) renderFooter() string {
	help := helpStyle.Render(fmt.Sprintf(
		"%s %s %s %s %s",
		m.keys().Quit.Help().Key,
		m.keys().NextTab.Help().Key,
		m.keys().PrevTab.Help().Key,
		m.keys().Up.Help().Key,
		m.keys().Down.Help().Key,
	))

	return help
}

func (m *model) updateList() {
	var items []list.Item

	switch m.currentTab {
	case 1: // Top Fixes
		if m.analysis != nil {
			for _, fix := range m.analysis.TopFixes {
				items = append(items, item{
					title:       fix.Title,
					description: fix.Description + "\n" + fix.File + ":" + fmt.Sprintf("%d", fix.Line),
					file:        fix.File,
					line:        fix.Line,
				})
			}
		}
	case 2: // Critical
		for _, f := range m.results.Findings {
			if f.Severity == scanner.SeverityCritical {
				items = append(items, item{
					title:       f.Title,
					description: f.Description,
					severity:    f.Severity,
					file:        f.File,
					line:        f.Line,
				})
			}
		}
	case 3: // High
		for _, f := range m.results.Findings {
			if f.Severity == scanner.SeverityHigh {
				items = append(items, item{
					title:       f.Title,
					description: f.Description,
					severity:    f.Severity,
					file:        f.File,
					line:        f.Line,
				})
			}
		}
	case 4: // All Findings
		for _, f := range m.results.Findings {
			items = append(items, item{
				title:       f.Title,
				description: f.Description,
				severity:    f.Severity,
				file:        f.File,
				line:        f.Line,
			})
		}
	}

	delegate := list.NewDefaultDelegate()
	delegate.Styles.SelectedTitle = delegate.Styles.SelectedTitle.
		BorderForeground(lipgloss.Color("1")).
		Foreground(lipgloss.Color("1"))
	delegate.Styles.SelectedDesc = delegate.Styles.SelectedDesc.
		BorderForeground(lipgloss.Color("1")).
		Foreground(lipgloss.Color("241"))

	m.list = list.New(items, delegate, m.width-4, m.height-10)
	m.list.Title = m.tabs[m.currentTab]
	m.list.SetShowStatusBar(false)
	m.list.SetFilteringEnabled(true)
	m.list.AdditionalShortHelpKeys = func() []key.Binding {
		return []key.Binding{
			m.keys().Quit,
			m.keys().NextTab,
			m.keys().PrevTab,
		}
	}
	m.list.AdditionalFullHelpKeys = func() []key.Binding {
		return []key.Binding{
			m.keys().Quit,
			m.keys().NextTab,
			m.keys().PrevTab,
		}
	}
}

func (m model) keys() keyMap {
	return newKeyMap()
}

// ShowInteractiveUI displays an interactive TUI for scan results
func ShowInteractiveUI(analysis *llm.AnalysisResult, results *scanner.ScanResults) error {
	tabs := []string{
		"Summary",
		"Top Fixes",
		"Critical",
		"High",
		"All Findings",
	}

	prog := progress.New(progress.WithDefaultGradient())
	prog.Width = 40

	m := model{
		analysis:     analysis,
		results:      results,
		currentTab:   0,
		tabs:         tabs,
		progress:     prog,
		showProgress: false,
	}

	m.updateList()

	p := tea.NewProgram(m, tea.WithAltScreen())
	_, err := p.Run()
	return err
}

