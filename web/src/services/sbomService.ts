/**
 * SBOM (Software Bill of Materials) Service
 * Generates SBOM in various formats (CycloneDX, SPDX)
 */

import type { SBOMDocument, SBOMFormat } from '../types'

export const sbomService = {
  /**
   * Generate SBOM for a project
   */
  async generateSBOM(
    path: string,
    format: SBOMFormat = 'cyclonedx'
  ): Promise<SBOMDocument> {
    try {
      const response = await fetch('/api/sbom/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path, format })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'SBOM generation failed' }))
        throw new Error(error.message || 'SBOM generation failed')
      }

      return await response.json()
    } catch (error) {
      console.error('SBOM generation error:', error)
      throw error
    }
  },

  /**
   * Export SBOM to file
   */
  async exportSBOM(sbom: SBOMDocument, format: 'json' | 'xml' = 'json'): Promise<void> {
    const extension = format === 'json' ? 'json' : 'xml'
    const content = format === 'json' 
      ? JSON.stringify(sbom, null, 2)
      : this.convertToXML(sbom)

    const blob = new Blob([content], { 
      type: format === 'json' ? 'application/json' : 'application/xml' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sbom-${sbom.format}-${Date.now()}.${extension}`
    a.click()
    URL.revokeObjectURL(url)
  },

  /**
   * Convert SBOM to XML (simplified)
   */
  convertToXML(sbom: SBOMDocument): string {
    // Simplified XML conversion - in production, use proper XML library
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
    xml += `<bom xmlns="http://cyclonedx.org/schema/bom/1.4" version="1">\n`
    xml += `  <components>\n`
    
    sbom.components.forEach((comp: { type: string; name: string; version: string; purl?: string }) => {
      xml += `    <component type="${comp.type}">\n`
      xml += `      <name>${this.escapeXML(comp.name)}</name>\n`
      xml += `      <version>${this.escapeXML(comp.version)}</version>\n`
      if (comp.purl) {
        xml += `      <purl>${this.escapeXML(comp.purl)}</purl>\n`
      }
      xml += `    </component>\n`
    })
    
    xml += `  </components>\n`
    xml += `</bom>`
    return xml
  },

  /**
   * Escape XML special characters
   */
  escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }
}

