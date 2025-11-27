package scanner

import (
	"fmt"
	"os"
	"time"
)

// ProgressTracker tracks scan progress
type ProgressTracker struct {
	totalSteps  int
	currentStep int
	stepNames   []string
	startTime   time.Time
	interactive bool
}

// NewProgressTracker creates a new progress tracker
func NewProgressTracker(interactive bool) *ProgressTracker {
	return &ProgressTracker{
		interactive: interactive,
		startTime:   time.Now(),
		stepNames:   []string{},
	}
}

// AddStep adds a step to the tracker
func (pt *ProgressTracker) AddStep(name string) {
	pt.stepNames = append(pt.stepNames, name)
	pt.totalSteps = len(pt.stepNames)
}

// StartStep starts a new step
func (pt *ProgressTracker) StartStep(stepIndex int, name string) {
	pt.currentStep = stepIndex + 1
	if pt.interactive {
		fmt.Printf("\r[%d/%d] %s...", pt.currentStep, pt.totalSteps, name)
		os.Stdout.Sync()
	} else {
		fmt.Printf("[%d/%d] %s...\n", pt.currentStep, pt.totalSteps, name)
	}
}

// CompleteStep marks a step as completed
func (pt *ProgressTracker) CompleteStep(stepIndex int, findings int) {
	if pt.interactive {
		if findings > 0 {
			fmt.Printf("\r[%d/%d] ✅ %s (%d findings)\n", stepIndex+1, pt.totalSteps, pt.stepNames[stepIndex], findings)
		} else {
			fmt.Printf("\r[%d/%d] ✅ %s\n", stepIndex+1, pt.totalSteps, pt.stepNames[stepIndex])
		}
	}
}

// Finish ends tracking and displays summary
func (pt *ProgressTracker) Finish(totalFindings int) {
	duration := time.Since(pt.startTime)
	if pt.interactive {
		fmt.Printf("\n✅ Scan completed in %v (%d findings)\n", duration.Round(time.Millisecond), totalFindings)
	}
}

// PrintSummary displays a scan summary
func (pt *ProgressTracker) PrintSummary(results *ScanResults) {
	fmt.Println()
	fmt.Println("📊 Scan summary:")
	fmt.Printf("   • Duration: %v\n", time.Since(pt.startTime).Round(time.Millisecond))
	fmt.Printf("   • Total findings: %d\n", results.Summary.Total)
	fmt.Printf("   • Critical: %d\n", results.Summary.Critical)
	fmt.Printf("   • High: %d\n", results.Summary.High)
	fmt.Printf("   • Medium: %d\n", results.Summary.Medium)
	fmt.Printf("   • Low: %d\n", results.Summary.Low)
	fmt.Println()
}
