package config

import (
	"os"
	"path/filepath"
	"testing"
)

func TestGetModel_fromEnv(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)
	t.Setenv("DSO_MODEL", "env-model")
	t.Parallel()
	if m := GetModel(); m != "env-model" {
		t.Fatalf("GetModel() = %q, want env-model", m)
	}
}

func TestSetModel_andGetModel_fromFile(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)
	t.Setenv("DSO_MODEL", "")
	t.Parallel()

	if err := SetModel("file-model"); err != nil {
		t.Fatal(err)
	}
	if m := GetModel(); m != "file-model" {
		t.Fatalf("GetModel() = %q after SetModel", m)
	}

	cfgPath := filepath.Join(home, ".dso", "config")
	data, err := os.ReadFile(cfgPath)
	if err != nil {
		t.Fatal(err)
	}
	if string(data) != "DSO_MODEL=file-model\n" {
		t.Fatalf("unexpected config file: %q", string(data))
	}
}
