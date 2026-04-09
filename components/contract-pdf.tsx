'use client'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import type { ContractFormValues } from '@/lib/schemas'
import type { ContractClause } from '@/types/contract'
import { buildContractDictionary } from '@/lib/markdown-generator'
import { replaceVariables } from '@/lib/template-engine'
import { BASE_CLAUSES } from '@/constants/clauses'

// Definimos estilos consistentes con un documento legal en Colombia
const styles = StyleSheet.create({
  page: {
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 50,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#000',
    lineHeight: 1.5,
  },
  title: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  paragraph: {
    marginBottom: 12,
    textAlign: 'justify',
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  signaturesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 60,
  },
  signatureBlock: {
    width: '45%',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 5,
  },
})

interface ContractPDFProps {
  values: ContractFormValues
}

export function ContractPDF({ values }: ContractPDFProps) {
  // Compartimos exactamente el mismo diccionario de variables que usa la vista previa Markdown
  const dict = buildContractDictionary(values)

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>CONTRATO DE ARRENDAMIENTO DE VIVIENDA URBANA</Text>

        {/* Párrafo Introductorio */}
        <Text style={styles.paragraph}>
          El presente contrato de arrendamiento se celebra, entre los suscritos a saber, por una parte:{' '}
          <Text style={styles.bold}>{dict.landlord_name}</Text>, mayor de edad, residente en el municipio de {dict.landlord_city}. Identificada con cédula de ciudadanía N° {dict.landlord_cedula}, quien en adelante se denominará <Text style={styles.bold}>ARRENDADOR</Text>; 
          y por la otra: <Text style={styles.bold}>{dict.tenant_name}</Text>, mayor de edad y residente en el municipio de {dict.tenant_city}. Identificado con cédula de ciudadanía N° {dict.tenant_cedula}, quien para todos los efectos jurídicos en adelante se denominará <Text style={styles.bold}>ARRENDATARIO</Text>, 
          celebramos el presente <Text style={styles.bold}>CONTRATO DE ARRENDAMIENTO DE VIVIENDA URBANA</Text>, en el municipio de {dict.municipality}. Que se regirá por las normas aplicables a la materia y especialmente por las siguientes cláusulas:
        </Text>

        {/* Mapeo de cláusulas estructuradas */}
        {(values.clauses && values.clauses.length > 0 ? values.clauses : BASE_CLAUSES)
            .map((clause: any) => {
              const isEnabled = clause.enabled !== undefined ? clause.enabled : clause.defaultEnabled
              if (!isEnabled && !clause.required) return null
              
              const clauseContent = replaceVariables(clause.content, dict)
              return (
                <Text key={clause.id} style={styles.paragraph}>
                  <Text style={styles.bold}>{clause.title}: </Text>
                  {clauseContent}
                </Text>
              )
            })}

        {/* Párrafo de Cierre */}
        <Text style={styles.paragraph}>
          Para constancia se firma por las partes, en el municipio de {dict.signature_city}, a los {dict.signature_day} días del mes de {dict.signature_month} del año {dict.signature_year}.
        </Text>

        {/* Bloque de Firmas */}
        <View style={styles.signaturesRow}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.bold}>{dict.landlord_name}</Text>
            <Text>ARRENDADOR</Text>
            <Text>C.C. {dict.landlord_cedula}</Text>
            <Text>Celular Nro. {dict.landlord_phone}</Text>
          </View>

          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.bold}>{dict.tenant_name}</Text>
            <Text>ARRENDATARIO</Text>
            <Text>C.C. {dict.tenant_cedula}</Text>
            <Text>Celular Nro. {dict.tenant_phone}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
