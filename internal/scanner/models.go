package scanner

import "time"

// Severity représente le niveau de sévérité
type Severity string

const (
	SeverityCritical Severity = "CRITICAL"
	SeverityHigh     Severity = "HIGH"
	SeverityMedium   Severity = "MEDIUM"
	SeverityLow      Severity = "LOW"
	SeverityInfo     Severity = "INFO"
)

// Finding représente une vulnérabilité ou un problème de sécurité
type Finding struct {
	ID          string    `json:"id"`
	Type        string    `json:"type"` // SAST, SECRET, DEPENDENCY, IAC
	Severity    Severity  `json:"severity"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	File        string    `json:"file"`
	Line        int       `json:"line,omitempty"`
	Column      int       `json:"column,omitempty"`
	RuleID      string    `json:"rule_id,omitempty"`
	Tool        string    `json:"tool"` // trivy, grype, gitleaks, tfsec, etc.
	Fixable     bool      `json:"fixable"`
	Fix         string    `json:"fix,omitempty"`         // Commande ou patch
	Exploitable bool      `json:"exploitable,omitempty"` // Est-ce exploitable en prod ?
	CVSS        float64   `json:"cvss,omitempty"`
	Timestamp   time.Time `json:"timestamp"`
}

// ScanResults contient tous les résultats d'un scan
type ScanResults struct {
	Path      string    `json:"path"`
	Timestamp time.Time `json:"timestamp"`
	Findings  []Finding `json:"findings"`
	Summary   Summary   `json:"summary"`
}

// Summary contient les statistiques du scan
type Summary struct {
	Total       int `json:"total"`
	Critical    int `json:"critical"`
	High        int `json:"high"`
	Medium      int `json:"medium"`
	Low         int `json:"low"`
	Info        int `json:"info"`
	Fixable     int `json:"fixable"`
	Exploitable int `json:"exploitable"`
}

// CalculateSummary calcule le résumé à partir des findings
func (sr *ScanResults) CalculateSummary() {
	sr.Summary = Summary{}
	for _, f := range sr.Findings {
		sr.Summary.Total++
		switch f.Severity {
		case SeverityCritical:
			sr.Summary.Critical++
		case SeverityHigh:
			sr.Summary.High++
		case SeverityMedium:
			sr.Summary.Medium++
		case SeverityLow:
			sr.Summary.Low++
		case SeverityInfo:
			sr.Summary.Info++
		}
		if f.Fixable {
			sr.Summary.Fixable++
		}
		if f.Exploitable {
			sr.Summary.Exploitable++
		}
	}
}
