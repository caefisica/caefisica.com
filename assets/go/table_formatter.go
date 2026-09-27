package main

import (
	"fmt"
	"os"
	"regexp"
	"strings"
)

func main() {
	files, err := os.ReadDir(".")
	if err != nil {
		fmt.Println("Error reading directory:", err)
		return
	}

	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".md") {
			processFile(file.Name())
		}
	}
}

func processFile(filename string) {
	content, err := os.ReadFile(filename)
	if err != nil {
		fmt.Println("Error reading file:", err)
		return
	}

	lines := strings.Split(string(content), "\n")
	var newLines []string

	tableStarted := false
	var table []string

	for _, line := range lines {
		if strings.HasPrefix(line, "|") {
			table = append(table, line)
			tableStarted = true
		} else {
			if tableStarted {
				newLines = append(newLines, processTable(table))
				table = nil
				tableStarted = false
			}
			newLines = append(newLines, line)
		}
	}

	newContent := strings.Join(newLines, "\n")
	err = os.WriteFile(filename, []byte(newContent), 0644)
	if err != nil {
		fmt.Println("Error writing file:", err)
		return
	}
}

func processTable(table []string) string {
	var formattedRows []string

	for _, row := range table[2:] {
		cells := strings.Split(row, "|")
		if len(cells) < 5 {
			continue
		}

		title, url := extractTitleAndURL(strings.TrimSpace(cells[1]))
		author := strings.TrimSpace(cells[2])
		editorial := strings.TrimSpace(cells[3])
		year := strings.TrimSpace(cells[4])

		formattedRow := fmt.Sprintf("  {{< book_row title=\"%s\" author=\"%s\" editorial=\"%s\" year=\"%s\" edition=\"%s\" url=\"%s\" >}}", title, author, editorial, year, year, url)
		formattedRows = append(formattedRows, formattedRow)
	}

	return "{{< book_table >}}\n" + strings.Join(formattedRows, "\n") + "\n{{< /book_table >}}"
}

func extractTitleAndURL(cell string) (string, string) {
	re := regexp.MustCompile(`\[(.*?)\]\((.*?)\)`)
	matches := re.FindStringSubmatch(cell)

	if len(matches) == 3 {
		return matches[1], matches[2]
	}

	return "", ""
}
