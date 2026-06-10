/**
 * Componente MDX: Signatures
 * Renderiza el bloque de firmas para arrendador y arrendatario.
 * Usa HTML/CSS inline para compatibilidad con Google Docs.
 */
interface SignaturesProps {
  landlordName?: string
  landlordCedula?: string
  landlordPhone?: string
  tenantName?: string
  tenantCedula?: string
  tenantPhone?: string
}

export function Signatures({
  landlordName = 'ARRENDADOR',
  landlordCedula = '',
  landlordPhone = '',
  tenantName = 'ARRENDATARIO',
  tenantCedula = '',
  tenantPhone = '',
}: SignaturesProps) {
  const SIG_P = 'font-size: 14pt; line-height: 1.0; text-align: left; margin: 0 0 4pt 0;'

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '80px' }}>
      <div>
        <p style={{ ...({ borderBottomWidth: '1px', borderBottomColor: '#000', marginBottom: '5px' } as any), ...({ fontSize: '14pt', lineHeight: '1.0', textAlign: 'left', margin: '0 0 4pt 0' } as any) }}>
          _____________________________________
        </p>
        <p style={SIG_P as any}>
          <b>{landlordName}</b>
          <br />
          ARRENDADOR
          <br />
          C.C. {landlordCedula}
          <br />
          Celular Nro. {landlordPhone}
        </p>
      </div>
      <div>
        <p style={{ ...({ borderBottomWidth: '1px', borderBottomColor: '#000', marginBottom: '5px' } as any), ...({ fontSize: '14pt', lineHeight: '1.0', textAlign: 'left', margin: '0 0 4pt 0' } as any) }}>
          _____________________________________
        </p>
        <p style={SIG_P as any}>
          <b>{tenantName}</b>
          <br />
          ARRENDATARIO
          <br />
          C.C. {tenantCedula}
          <br />
          Celular Nro. {tenantPhone}
        </p>
      </div>
    </div>
  )
}
