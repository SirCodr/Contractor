import type { ContractFormValues } from './schemas'
import type { ContractClause } from '@/types/contract'
import { BASE_CLAUSES } from '@/constants/clauses'
import { numberToSpanishText, formatCurrency, replaceVariables } from './template-engine'

export function buildContractDictionary(values: ContractFormValues): Record<string, string> {
  return {
    landlord_name: values.landlord.name.toUpperCase(),
    landlord_cedula: values.landlord.cedula,
    landlord_city: values.landlord.city,
    landlord_phone: values.landlord.phone || '',
    
    tenant_name: values.tenant.name.toUpperCase(),
    tenant_cedula: values.tenant.cedula,
    tenant_city: values.tenant.city,
    tenant_phone: values.tenant.phone || '',
    
    municipality: values.property.city,
    property_type: values.property.type === 'apartment' ? 'un apartamento' : values.property.type === 'house' ? 'una casa' : 'un local comercial',
    property_floor: values.property.floor ? ` en un ${values.property.floor} piso` : '',
    property_address: values.property.address,
    property_neighborhood: values.property.neighborhood,
    property_description: values.property.description,
    
    rent_amount: formatCurrency(values.monthlyRent),
    rent_amount_text: numberToSpanishText(values.monthlyRent),
    bank_payment_text: values.bankName ? ` o mediante transferencia a la cuenta de ahorros ${values.bankName} Nro. ${values.bankAccount}` : '',
    bank_name: values.bankName || '',
    bank_account: values.bankAccount || '',
    
    start_date: values.startDate,
    end_date: values.endDate,
    duration_months: values.durationMonths.toString() + ` (${numberToSpanishText(values.durationMonths)}) meses`,
    max_occupants: values.maxOccupants || 'dos',
    
    deposit_amount: formatCurrency(values.depositAmount || 0),
    deposit_amount_text: numberToSpanishText(values.depositAmount || 0),
    
    signature_city: values.signatureCity || values.property.city,
    signature_day: values.signatureDay,
    signature_month: values.signatureMonth,
    signature_year: values.signatureYear,
  }
}

export function generateContractMarkdown(values: ContractFormValues): string {
  // 1. Preparar las variables para inyectarlas basadas en el formulario
  const dict = buildContractDictionary(values)

  // 2. Encabezado principal del contrato (Intro)
  let markdown = `# **CONTRATO DE ARRENDAMIENTO DE VIVIENDA URBANA**\n\n`
  
  markdown += `El presente contrato de arrendamiento se celebra, entre los suscritos a saber, por una parte: **${dict.landlord_name}**, mayor de edad, residente en el municipio de ${dict.landlord_city}. Identificada con cédula de ciudadanía N° ${dict.landlord_cedula}, quien en adelante se denominará **ARRENDADOR**; y por la otra: **${dict.tenant_name}**, mayor de edad y residente en el municipio de ${dict.tenant_city}. Identificado con cédula de ciudadanía N° ${dict.tenant_cedula}, quien para todos los efectos jurídicos en adelante se denominará **ARRENDATARIO**, celebramos el presente **CONTRATO DE ARRENDAMIENTO DE VIVIENDA URBANA**, en el municipio de ${dict.municipality}. Que se regirá por las normas aplicables a la materia y especialmente por las siguientes cláusulas:\n\n`

  // 3. Procesamiento de Cláusulas desde el formulario o plantilla base
  const clausesToRender = values.clauses && values.clauses.length > 0 ? values.clauses : BASE_CLAUSES

  clausesToRender.forEach((clause: any) => {
    // Soportar la propiedad 'enabled' (del formulario) o 'defaultEnabled' (de la plantilla base)
    const isEnabled = clause.enabled !== undefined ? clause.enabled : clause.defaultEnabled
    
    // Ignorar la cláusula si fue deshabilitada (y no es estrictamente requerida)
    if (!isEnabled && !clause.required) return

    // Reemplazamos las variables `{{llave}}` en el contenido de la cláusula
    const clauseContent = replaceVariables(clause.content, dict)
    
    // Aplicar negrita al título de la cláusula y concatenar con el doble salto de línea
    markdown += `**${clause.title}:** ${clauseContent}\n\n`
  })

  // 4. Pie de página (Footer) y Firmas
  markdown += `Para constancia se firma por las partes, en el municipio de ${dict.signature_city}, a los ${dict.signature_day} días del mes de ${dict.signature_month} del año ${dict.signature_year}.\n\n`
  
  // Usamos Flexbox de CSS sobre un DIV de HTML embebido en el Markdown
  markdown += `<div style="display: flex; justify-content: space-between; margin-top: 80px;">
  <div>
    <p>_____________________________________</p>
    <p>
      <b>${dict.landlord_name}</b><br/>
      ARRENDADOR<br/>
      C.C. ${dict.landlord_cedula}<br/>
      Celular Nro. ${dict.landlord_phone}
    </p>
  </div>
  <div>
    <p>_____________________________________</p>
    <p>
      <b>${dict.tenant_name}</b><br/>
      ARRENDATARIO<br/>
      C.C. ${dict.tenant_cedula}<br/>
      Celular Nro. ${dict.tenant_phone}
    </p>
  </div>
</div>`

  return markdown
}
