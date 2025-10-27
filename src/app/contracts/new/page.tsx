"use client"

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { FileText, Download, Printer, Mail, CheckCircle, Calendar, Home, User, DollarSign, FileSignature, MessageCircle, X } from 'lucide-react'

function NewContractContent() {
  const params = useSearchParams()
  const propertyId = params.get('propertyId')
  const [property, setProperty] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [step, setStep] = useState<'form' | 'preview' | 'sign'>('form')
  const [language, setLanguage] = useState<'english' | 'kinyarwanda'>('english')
  const [showShareModal, setShowShareModal] = useState(false)
  const [signatures, setSignatures] = useState({
    landlord: '',
    tenant: '',
    landlordSigned: false,
    tenantSigned: false,
  })
  const printRef = useRef<HTMLDivElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    // Landlord info
    landlordName: '',
    landlordIdType: 'national-id',
    landlordId: '',
    landlordPhone: '',
    landlordEmail: '',
    
    // Tenant info
    tenantName: '',
    tenantIdType: 'national-id',
    tenantId: '',
    tenantPhone: '',
    tenantEmail: '',
    tenantOccupation: '',
    
    // Lease terms
    startDate: '',
    endDate: '',
    monthlyRent: '',
    securityDeposit: '',
    paymentDueDay: '1',
    
    // Property details (auto-filled)
    propertyAddress: '',
    propertyLocation: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    
    // Additional terms
    utilitiesIncluded: [] as string[],
    specialTerms: '',
    maintenanceResponsibility: 'landlord',
    petPolicy: 'not-allowed',
  })

  useEffect(() => {
    fetchProperty()
    fetchCurrentUser()
  }, [propertyId])

  const fetchCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setCurrentUser(session.user)
      // Pre-fill landlord info and mark them as landlord
      setFormData(prev => ({
        ...prev,
        landlordEmail: session.user.email || '',
      }))
      // Auto-sign landlord if their email matches
      if (session.user.email === formData.landlordEmail && !signatures.landlordSigned) {
        setSignatures(prev => ({
          ...prev,
          landlord: formData.landlordName,
          landlordSigned: false // They still need to confirm
        }))
      }
    }
  }

  const isLandlord = currentUser?.email === formData.landlordEmail
  const isTenant = currentUser?.email === formData.tenantEmail

  const handleShareWithTenant = () => {
    setShowShareModal(true)
  }

  const handleShareByEmail = () => {
    const subject = encodeURIComponent('Please Sign Lease Agreement')
    const body = encodeURIComponent(
      `Dear ${formData.tenantName},\n\nPlease review and sign the lease agreement for ${formData.propertyAddress}.\n\nAccess the agreement here: ${window.location.href}\n\nBest regards,\n${formData.landlordName}`
    )
    window.open(`mailto:${formData.tenantEmail}?subject=${subject}&body=${body}`, '_blank')
    setShowShareModal(false)
  }

  const handleShareByWhatsApp = () => {
    const message = encodeURIComponent(
      `Dear ${formData.tenantName},\n\nPlease review and sign the lease agreement for ${formData.propertyAddress}.\n\nAccess the agreement here: ${window.location.href}\n\nBest regards,\n${formData.landlordName}`
    )
    // Remove any non-digit characters from phone
    const phone = formData.tenantPhone.replace(/\D/g, '')
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    setShowShareModal(false)
  }

  const fetchProperty = async () => {
    if (!propertyId) return
    try {
      const res = await fetch(`/api/properties/${propertyId}`)
      const json = await res.json()
      if (json.success) {
        const prop = json.data
        setProperty(prop)
        setFormData(prev => ({
          ...prev,
          propertyAddress: `${prop.title}, ${prop.district}, ${prop.sector || ''}, Kigali`,
          propertyLocation: `${prop.district}, ${prop.sector || ''}, ${prop.cell || ''}, Kigali, Rwanda`,
          propertyType: prop.property_type,
          bedrooms: prop.bedrooms?.toString() || '',
          bathrooms: prop.bathrooms?.toString() || '',
          monthlyRent: prop.price?.toString() || '',
          securityDeposit: (prop.price * 1)?.toString() || '', // Default to 1 month rent
        }))
      }
    } catch (err) {
      console.error('Error fetching property:', err)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleUtilitiesChange = (utility: string) => {
    setFormData(prev => ({
      ...prev,
      utilitiesIncluded: prev.utilitiesIncluded.includes(utility)
        ? prev.utilitiesIncluded.filter(u => u !== utility)
        : [...prev.utilitiesIncluded, utility]
    }))
  }

  const handleGenerateLease = () => {
    setStep('preview')
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML
      const printWindow = window.open('', '', 'height=800,width=800')
      if (printWindow) {
        printWindow.document.write('<html><head><title>Lease Agreement</title>')
        printWindow.document.write('<style>')
        printWindow.document.write(`
          body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; color: #333; }
          h1 { text-align: center; color: #1f2937; border-bottom: 3px solid #10b981; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
          .section { margin: 20px 0; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
          .info-item { margin: 8px 0; }
          .label { font-weight: bold; color: #4b5563; }
          .signature-section { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
          .signature-box { border-top: 2px solid #000; padding-top: 10px; }
          ul { margin: 10px 0; padding-left: 25px; }
          .terms { background: #f9fafb; padding: 15px; border-left: 3px solid #10b981; margin: 15px 0; }
        `)
        printWindow.document.write('</style></head><body>')
        printWindow.document.write(printContent)
        printWindow.document.write('</body></html>')
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  if (step === 'preview' || step === 'sign') {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="text-gray-900 font-semibold">KeyLinka</Link>
            <div className="flex items-center gap-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'english' | 'kinyarwanda')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-400"
              >
                <option value="english">English</option>
                <option value="kinyarwanda">Kinyarwanda</option>
              </select>
              <button onClick={() => setStep('form')} className="text-sm text-gray-600 hover:text-gray-900">
                ← Edit Details
              </button>
              {step === 'preview' && (
                <button 
                  onClick={() => setStep('sign')} 
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
                >
                  <FileSignature className="h-4 w-4" />
                  Sign Agreement
                </button>
              )}
              {step === 'sign' && (
                <>
                  <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    <Printer className="h-4 w-4" />
                    Print
                  </button>
                  <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Signature Status Banner - Only shown in sign mode */}
        {step === 'sign' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 print:hidden">
            <div className={`rounded-lg p-4 ${
              signatures.landlordSigned && signatures.tenantSigned 
                ? 'bg-gray-50 border-2 border-gray-400' 
                : 'bg-gray-50 border-2 border-gray-300'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {language === 'english' ? 'Digital Signature Status' : 'Uko umukono wa digitale umeze'}
                  </h3>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {signatures.landlordSigned ? (
                        <CheckCircle className="h-5 w-5 text-gray-600" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-400"></div>
                      )}
                      <span className="text-sm">
                        {language === 'english' ? 'Landlord Signature' : 'Umukono wa nyir\'inzu'}: 
                        <span className={signatures.landlordSigned ? 'text-gray-700 font-semibold ml-1' : 'text-gray-500 ml-1'}>
                          {signatures.landlordSigned ? (language === 'english' ? 'Signed' : 'Yashyizweho') : (language === 'english' ? 'Pending' : 'Ntiyashyizweho')}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {signatures.tenantSigned ? (
                        <CheckCircle className="h-5 w-5 text-gray-600" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-400"></div>
                      )}
                      <span className="text-sm">
                        {language === 'english' ? 'Tenant Signature' : 'Umukono w\'ukodesha'}: 
                        <span className={signatures.tenantSigned ? 'text-gray-700 font-semibold ml-1' : 'text-gray-500 ml-1'}>
                          {signatures.tenantSigned ? (language === 'english' ? 'Signed' : 'Yashyizweho') : (language === 'english' ? 'Pending' : 'Ntiyashyizweho')}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                {signatures.landlordSigned && signatures.tenantSigned && (
                  <div className="text-gray-700">
                    <CheckCircle className="h-12 w-12" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div ref={printRef} className="bg-white shadow-lg rounded-lg p-12 print:shadow-none">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {language === 'english' ? 'RESIDENTIAL LEASE AGREEMENT' : 'AMASEZERANO YO GUKODESHA INZU'}
              </h1>
              <p className="text-sm text-gray-600">
                {language === 'english' ? 'Republic of Rwanda' : 'Repubulika y\'u Rwanda'}
              </p>
            </div>

            {/* Agreement Introduction */}
            <div className="mb-8">
              <p className="text-sm leading-relaxed">
                {language === 'english' ? (
                  <>Entered into on <span className="font-semibold">{new Date().toLocaleDateString()}</span>, between:</>
                ) : (
                  <>Yakozwe ku wa <span className="font-semibold">{new Date().toLocaleDateString()}</span>, hagati ya:</>
                )}
              </p>
            </div>

            {/* Parties */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {language === 'english' ? 'PARTIES TO THE AGREEMENT' : 'ABANTU BAGIZE AMASEZERANO'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-300 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Home className="h-5 w-5 text-green-600" />
                    {language === 'english' ? 'LANDLORD (Lessor)' : 'NYIR\'INZU (Uwukodesha)'}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">{language === 'english' ? 'Name:' : 'Izina:'}</span> {formData.landlordName}</p>
                    <p><span className="font-medium">{language === 'english' ? `${formData.landlordIdType === 'passport' ? 'Passport' : 'ID Number'}:` : `${formData.landlordIdType === 'passport' ? 'Pasiporo' : 'Nomero y\'indangamuntu'}:`}</span> {formData.landlordId}</p>
                    <p><span className="font-medium">{language === 'english' ? 'Phone:' : 'Telefoni:'}</span> {formData.landlordPhone}</p>
                    <p><span className="font-medium">{language === 'english' ? 'Email:' : 'Imeri:'}</span> {formData.landlordEmail}</p>
                  </div>
                </div>

                <div className="border border-gray-300 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    {language === 'english' ? 'TENANT (Lessee)' : 'UKODESHA (Uwukodeshwa)'}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">{language === 'english' ? 'Name:' : 'Izina:'}</span> {formData.tenantName}</p>
                    <p><span className="font-medium">{language === 'english' ? `${formData.tenantIdType === 'passport' ? 'Passport' : 'ID Number'}:` : `${formData.tenantIdType === 'passport' ? 'Pasiporo' : 'Nomero y\'indangamuntu'}:`}</span> {formData.tenantId}</p>
                    <p><span className="font-medium">{language === 'english' ? 'Phone:' : 'Telefoni:'}</span> {formData.tenantPhone}</p>
                    <p><span className="font-medium">{language === 'english' ? 'Email:' : 'Imeri:'}</span> {formData.tenantEmail}</p>
                    <p><span className="font-medium">{language === 'english' ? 'Occupation:' : 'Umwuga:'}</span> {formData.tenantOccupation}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {language === 'english' ? 'PROPERTY DESCRIPTION' : 'IBISOBANURO BY\'INZU'}
              </h2>
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p className="col-span-2"><span className="font-medium">{language === 'english' ? 'Address:' : 'Aderesi:'}</span> {formData.propertyAddress}</p>
                  <p className="col-span-2"><span className="font-medium">{language === 'english' ? 'Location:' : 'Ahantu iherereye:'}</span> {formData.propertyLocation}</p>
                  <p><span className="font-medium">{language === 'english' ? 'Type:' : 'Ubwoko:'}</span> {formData.propertyType}</p>
                  <p><span className="font-medium">{language === 'english' ? 'Bedrooms:' : 'Ibyumba byo kuraramo:'}</span> {formData.bedrooms}</p>
                  <p><span className="font-medium">{language === 'english' ? 'Bathrooms:' : 'Ubwiherero:'}</span> {formData.bathrooms}</p>
                </div>
              </div>
            </div>

            {/* Lease Terms */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {language === 'english' ? 'LEASE TERMS' : 'AMATEGEKO Y\'UBUKODE'}
              </h2>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <p><span className="font-medium">{language === 'english' ? 'Lease Start Date:' : 'Itariki yo gutangira:'}</span> {new Date(formData.startDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">{language === 'english' ? 'Lease End Date:' : 'Itariki yo kurangiza:'}</span> {new Date(formData.endDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">{language === 'english' ? 'Monthly Rent:' : 'Ubukode bwa buri kwezi:'}</span> {parseInt(formData.monthlyRent).toLocaleString()} RWF</p>
                  <p><span className="font-medium">{language === 'english' ? 'Security Deposit:' : 'Ingwate:'}</span> {parseInt(formData.securityDeposit).toLocaleString()} RWF</p>
                  <p><span className="font-medium">{language === 'english' ? 'Payment Due:' : 'Itariki yo kwishyura:'}</span> {language === 'english' ? `Day ${formData.paymentDueDay} of each month` : `Umunsi wa ${formData.paymentDueDay} wa buri kwezi`}</p>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {language === 'english' ? 'TERMS AND CONDITIONS' : 'AMABWIRIZA N\'AMATEGEKO'}
              </h2>
              
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    {language === 'english' ? '1. RENT PAYMENT' : '1. KWISHYURA UBUKODE'}
                  </h3>
                  <p className="ml-4 leading-relaxed">
                    {language === 'english' ? (
                      <>The Tenant agrees to pay rent of <span className="font-semibold">{parseInt(formData.monthlyRent).toLocaleString()} RWF</span> per month, 
                      due on the <span className="font-semibold">{formData.paymentDueDay}{getOrdinalSuffix(parseInt(formData.paymentDueDay))}</span> day of each month. 
                      Payment shall be made via bank transfer, mobile money, or as otherwise agreed upon by both parties.</>
                    ) : (
                      <>Ukodesha yemera kwishyura ubukode bwa <span className="font-semibold">{parseInt(formData.monthlyRent).toLocaleString()} RWF</span> buri kwezi, 
                      ku munsi wa <span className="font-semibold">{formData.paymentDueDay}</span> wa buri kwezi. 
                      Kwishyura bikorwa binyuze kuri banki, mobile money, cyangwa mu bundi buryo impande zombi zemereranye.</>
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    {language === 'english' ? '2. SECURITY DEPOSIT' : '2. INGWATE'}
                  </h3>
                  <p className="ml-4 leading-relaxed">
                    {language === 'english' ? (
                      <>The Tenant has paid a security deposit of <span className="font-semibold">{parseInt(formData.securityDeposit).toLocaleString()} RWF</span>. 
                      This deposit will be refunded within 14 days after the lease termination, subject to deductions for any damages beyond normal wear and tear, 
                      unpaid rent, or other breaches of this agreement.</>
                    ) : (
                      <>Ukodesha yishyuye ingwate ya <span className="font-semibold">{parseInt(formData.securityDeposit).toLocaleString()} RWF</span>. 
                      Iyi ngwate izasubizwa mu minsi 14 nyuma yo kurangiza amasezerano, keretse ibyonenewe birenze ibisanzwe, 
                      ubukode butagishyuwe, cyangwa ibindi byemezo by'amasezerano byaciwemo.</>
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    {language === 'english' ? '3. UTILITIES' : '3. SERIVISI Z\'IBANZE'}
                  </h3>
                  <p className="ml-4 leading-relaxed">
                    {language === 'english' ? (
                      formData.utilitiesIncluded.length > 0 ? (
                        <>The following utilities are included in the rent: {formData.utilitiesIncluded.join(', ')}. 
                        All other utilities shall be the responsibility of the Tenant.</>
                      ) : (
                        <>All utilities including water, electricity, internet, and other services are the responsibility of the Tenant 
                        and shall be paid directly to the respective service providers.</>
                      )
                    ) : (
                      formData.utilitiesIncluded.length > 0 ? (
                        <>Serivisi zikurikira ziri mu bukode: {formData.utilitiesIncluded.join(', ')}. 
                        Izindi serivisi zose ni inshingano z'ukodesha.</>
                      ) : (
                        <>Serivisi zose harimo amazi, amashanyarazi, interineti, n'izindi serivisi ni inshingano z'ukodesha 
                        kandi zigomba kwishyurwa bitaziguye ku batanga serivisi.</>
                      )
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    {language === 'english' ? '4. MAINTENANCE AND REPAIRS' : '4. KUBUNGABUNGA NO GUSANA'}
                  </h3>
                  <p className="ml-4 leading-relaxed">
                    {language === 'english' ? (
                      formData.maintenanceResponsibility === 'landlord' ? (
                        <>The Landlord is responsible for major repairs and maintenance of the property's structure, plumbing, and electrical systems. 
                        The Tenant is responsible for minor repairs and keeping the property in good condition.</>
                      ) : (
                        <>The Tenant is responsible for all maintenance and repairs during the lease period, except for structural issues 
                        which remain the Landlord's responsibility.</>
                      )
                    ) : (
                      formData.maintenanceResponsibility === 'landlord' ? (
                        <>Nyir'inzu ashinzwe gusana no kubungabunga inzu, imiyoboro n'amashanyarazi. 
                        Ukodesha ashinzwe gusana ibintu bito no kubungabunga inzu neza.</>
                      ) : (
                        <>Ukodesha ashinzwe kubungabunga no gusana byose mu gihe cy'ubukode, usibye ibibazo by'imiterere y'inzu 
                        bishingiye kuri nyir'inzu.</>
                      )
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    {language === 'english' ? '5. USE OF PREMISES' : '5. GUKORESHA INZU'}
                  </h3>
                  <p className="ml-4 leading-relaxed">
                    {language === 'english' ? (
                      <>The property shall be used solely for residential purposes. The Tenant shall not use the premises for any illegal activities 
                      or purposes that violate Rwandan law.</>
                    ) : (
                      <>Inzu igomba gukoreshwa mu guturamo gusa. Ukodesha ntashobora kuyikoresha mu bikorwa bitemewe n'amategeko 
                      cyangwa ibinyuranyije n'amategeko y'u Rwanda.</>
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    {language === 'english' ? '6. PETS POLICY' : '6. AMATEGEKO Y\'AMATUNGO'}
                  </h3>
                  <p className="ml-4 leading-relaxed">
                    {language === 'english' ? (
                      formData.petPolicy === 'allowed' ? 'Pets are allowed on the premises with prior written consent from the Landlord.' : 
                      formData.petPolicy === 'allowed-with-deposit' ? 'Pets are allowed with an additional deposit and prior written consent from the Landlord.' : 
                      'No pets are allowed on the premises without prior written consent from the Landlord.'
                    ) : (
                      formData.petPolicy === 'allowed' ? 'Amatungo yemerewe mu nzu iyo nyir\'inzu yemeje mu nyandiko mbere.' : 
                      formData.petPolicy === 'allowed-with-deposit' ? 'Amatungo yemerewe hamwe n\'ingwate y\'inyongera iyo nyir\'inzu yemeje mu nyandiko mbere.' : 
                      'Amatungo ntayemerewe mu nzu keretse nyir\'inzu yemeje mu nyandiko mbere.'
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    {language === 'english' ? '7. TERMINATION' : '7. KURANGIZA AMASEZERANO'}
                  </h3>
                  <p className="ml-4 leading-relaxed">
                    {language === 'english' ? (
                      <>Either party may terminate this agreement with 30 days written notice. Early termination by the Tenant without proper notice 
                      may result in forfeiture of the security deposit. The Landlord reserves the right to terminate immediately for breach of agreement.</>
                    ) : (
                      <>Buri ruhande rushobora kurangiza aya masezerano hamaze iminsi 30 nyuma yo kumenyesha mu nyandiko. Kurangiza amasezerano hakiri kare n'ukodesha atabanje kumenyesha neza 
                      bishobora gutera kubura ingwate. Nyir'inzu afite uburenganzira bwo kurangiza ako kanya iyo amasezerano yaciwemo.</>
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    {language === 'english' ? '8. PROPERTY INSPECTION' : '8. KUGENZURA INZU'}
                  </h3>
                  <p className="ml-4 leading-relaxed">
                    {language === 'english' ? (
                      <>The Landlord reserves the right to inspect the property with 24 hours notice to the Tenant, during reasonable hours.</>
                    ) : (
                      <>Nyir'inzu afite uburenganzira bwo kugenzura inzu nyuma yo kumenyesha ukodesha amasaha 24 mbere, mu gihe cy'amasaha akwiye.</>
                    )}
                  </p>
                </div>

                {formData.specialTerms && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">
                      {language === 'english' ? '9. SPECIAL TERMS' : '9. AMABWIRIZA YIHARIYE'}
                    </h3>
                    <p className="ml-4 leading-relaxed whitespace-pre-wrap">{formData.specialTerms}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Agreement Clause */}
            <div className="mb-12 bg-gray-50 border-l-4 border-gray-500 p-4">
              <p className="text-sm leading-relaxed text-gray-700">
                {language === 'english' ? (
                  <>Both parties have read and understood all terms of this agreement and agree to be bound by them. 
                  This agreement is governed by the laws of the Republic of Rwanda.</>
                ) : (
                  <>Impande zombi zasomye kandi zibyumvise amabwiriza yose y'aya masezerano kandi zemeye kuyubahiriza. 
                  Aya masezerano ayobowe n'amategeko ya Repubulika y'u Rwanda.</>
                )}
              </p>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">
                  {language === 'english' ? "LANDLORD/LADY'S SIGNATURE" : 'UMUKONO WA NYIR\'INZU'}
                </h3>
                {step === 'sign' && !signatures.landlordSigned && isLandlord ? (
                  <div className="print:hidden">
                    <input
                      type="text"
                      placeholder={language === 'english' ? "Type your full name to sign" : "Andika amazina yawe yose kugira ngo ushyire umukono"}
                      value={signatures.landlord}
                      onChange={(e) => setSignatures(prev => ({ ...prev, landlord: e.target.value }))}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-gray-400"
                    />
                    <button
                      onClick={() => {
                        if (signatures.landlord.trim()) {
                          setSignatures(prev => ({ ...prev, landlordSigned: true }))
                        }
                      }}
                      disabled={!signatures.landlord.trim()}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {language === 'english' ? 'Confirm Signature' : 'Emeza Umukono'}
                    </button>
                  </div>
                ) : signatures.landlordSigned ? (
                  <div>
                    <div className="border-b-2 border-gray-600 mb-2 h-16 flex items-end pb-2">
                      <span className="text-2xl font-signature italic text-gray-700">{signatures.landlord}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>{language === 'english' ? 'Digitally Signed' : 'Yashyizweho umukono wa digitale'}</span>
                    </div>
                    <p className="text-sm">Name: {formData.landlordName}</p>
                    <p className="text-sm">Date: {new Date().toLocaleDateString()}</p>
                  </div>
                ) : step === 'sign' && !isLandlord ? (
                  <div className="print:hidden bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                    <p className="text-sm text-gray-600 text-center">
                      {language === 'english' 
                        ? 'Waiting for landlord/lady to sign...' 
                        : 'Tegereza nyir\'inzu ashyire umukono...'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="border-b-2 border-black mb-2 h-16"></div>
                    <p className="text-sm">Name: {formData.landlordName}</p>
                    <p className="text-sm">Date: _____________________</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-4">
                  {language === 'english' ? "TENANT'S SIGNATURE" : 'UMUKONO W\'UKODESHA'}
                </h3>
                {step === 'sign' && !signatures.tenantSigned && isTenant ? (
                  <div className="print:hidden">
                    <input
                      type="text"
                      placeholder={language === 'english' ? "Type your full name to sign" : "Andika amazina yawe yose kugira ngo ushyire umukono"}
                      value={signatures.tenant}
                      onChange={(e) => setSignatures(prev => ({ ...prev, tenant: e.target.value }))}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-gray-400"
                    />
                    <button
                      onClick={() => {
                        if (signatures.tenant.trim()) {
                          setSignatures(prev => ({ ...prev, tenantSigned: true }))
                        }
                      }}
                      disabled={!signatures.tenant.trim()}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {language === 'english' ? 'Confirm Signature' : 'Emeza Umukono'}
                    </button>
                  </div>
                ) : signatures.tenantSigned ? (
                  <div>
                    <div className="border-b-2 border-gray-600 mb-2 h-16 flex items-end pb-2">
                      <span className="text-2xl font-signature italic text-gray-700">{signatures.tenant}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>{language === 'english' ? 'Digitally Signed' : 'Yashyizweho umukono wa digitale'}</span>
                    </div>
                    <p className="text-sm">Name: {formData.tenantName}</p>
                    <p className="text-sm">Date: {new Date().toLocaleDateString()}</p>
                  </div>
                ) : step === 'sign' && !isTenant ? (
                  <div className="print:hidden bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                    <p className="text-sm text-gray-600 text-center">
                      {language === 'english' 
                        ? 'Waiting for tenant to sign...' 
                        : 'Tegereza ukodesha ashyire umukono...'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="border-b-2 border-black mb-2 h-16"></div>
                    <p className="text-sm">Name: {formData.tenantName}</p>
                    <p className="text-sm">Date: _____________________</p>
                  </div>
                )}
              </div>
            </div>

            {/* Witnesses and Notary */}
            <div className="mt-12 pt-8 border-t-2 border-gray-300">
              <h3 className="font-semibold text-gray-700 mb-6">
                {language === 'english' ? 'WITNESSES & PUBLIC NOTARY (Optional)' : 'ABATANGABUHAMYA N\'UMWE MU NOTAIRE YA LETA (Bitari ngombwa)'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <div className="border-b-2 border-gray-400 mb-2 h-12"></div>
                  <p className="text-sm font-medium">{language === 'english' ? 'Witness 1 Signature' : 'Umwanzuro w\'Umutangabuhamya 1'}</p>
                  <p className="text-sm mt-2">{language === 'english' ? 'Name:' : 'Izina:'} _____________________</p>
                  <p className="text-sm">{language === 'english' ? 'ID:' : 'Indangamuntu:'} _____________________</p>
                </div>

                <div>
                  <div className="border-b-2 border-gray-400 mb-2 h-12"></div>
                  <p className="text-sm font-medium">{language === 'english' ? 'Witness 2 Signature' : 'Umwanzuro w\'Umutangabuhamya 2'}</p>
                  <p className="text-sm mt-2">{language === 'english' ? 'Name:' : 'Izina:'} _____________________</p>
                  <p className="text-sm">{language === 'english' ? 'ID:' : 'Indangamuntu:'} _____________________</p>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
                  <div className="border-b-2 border-yellow-600 mb-2 h-12"></div>
                  <p className="text-sm font-semibold text-yellow-900">{language === 'english' ? 'Public Notary Seal & Signature' : 'Kashe n\'Umwanzuro bya Notaire'}</p>
                  <p className="text-sm mt-2">{language === 'english' ? 'Name:' : 'Izina:'} _____________________</p>
                  <p className="text-sm">{language === 'english' ? 'License No:' : 'Nomero y\'uruhushya:'} _____________________</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons for print view */}
          <div className="mt-6 flex justify-center gap-4 print:hidden">
            {step === 'preview' ? (
              <>
                <button onClick={() => setStep('form')} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  {language === 'english' ? 'Edit Agreement' : 'Hindura Amasezerano'}
                </button>
                <button onClick={() => setStep('sign')} className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2">
                  <FileSignature className="h-5 w-5" />
                  {language === 'english' ? 'Sign Agreement' : 'Shyira Umukono'}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setStep('preview')} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  {language === 'english' ? 'Back to Preview' : 'Subira Kureba'}
                </button>
                
                {/* Show Share button if landlord has signed but tenant hasn't */}
                {isLandlord && signatures.landlordSigned && !signatures.tenantSigned && (
                  <button 
                    onClick={handleShareWithTenant}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Mail className="h-5 w-5" />
                    {language === 'english' ? 'Share with Tenant' : 'Ohereza Ukodesha'}
                  </button>
                )}

                {/* Show Print/Download only when both have signed */}
                {signatures.landlordSigned && signatures.tenantSigned && (
                  <>
                    <button onClick={handlePrint} className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2">
                      <Printer className="h-5 w-5" />
                      {language === 'english' ? 'Print Agreement' : 'Icapira Amasezerano'}
                    </button>
                    <button onClick={handleDownload} className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      {language === 'english' ? 'Download PDF' : 'Pakurura PDF'}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'english' ? 'Share with Tenant' : 'Sangiza Ukodesha'}
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              {language === 'english' 
                ? 'Choose how you want to share the agreement:' 
                : 'Hitamo uburyo ushaka gusangiza amasezerano:'}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleShareByEmail}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span>{language === 'english' ? 'Share via Email' : 'Sangiza kuri Email'}</span>
              </button>
              <button
                onClick={handleShareByWhatsApp}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                <span>{language === 'english' ? 'Share via WhatsApp' : 'Sangiza kuri WhatsApp'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-gray-900 font-semibold">KeyLinka</Link>
          <Link href="/properties" className="text-sm text-gray-600 hover:text-gray-900">Back to properties</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Lease Agreement</h1>
          <p className="text-gray-600">Fill in the details below to create a customized lease agreement</p>
          {property && (
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Property:</span> {property.title} - {parseInt(property.price).toLocaleString()} RWF/month
              </p>
            </div>
          )}
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          {/* Landlord Information */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Home className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Landlord Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="landlordName"
                  value={formData.landlordName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Type *</label>
                <select
                  name="landlordIdType"
                  value={formData.landlordIdType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="national-id">National ID</option>
                  <option value="passport">Passport</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.landlordIdType === 'passport' ? 'Passport Number *' : 'ID Number *'}
                </label>
                <input
                  type="text"
                  name="landlordId"
                  value={formData.landlordId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="landlordPhone"
                  value={formData.landlordPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="landlordEmail"
                  value={formData.landlordEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Tenant Information */}
          <div className="mb-8 pt-8 border-t">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Tenant Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="tenantName"
                  value={formData.tenantName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Type *</label>
                <select
                  name="tenantIdType"
                  value={formData.tenantIdType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="national-id">National ID</option>
                  <option value="passport">Passport</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.tenantIdType === 'passport' ? 'Passport Number *' : 'ID Number *'}
                </label>
                <input
                  type="text"
                  name="tenantId"
                  value={formData.tenantId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="tenantPhone"
                  value={formData.tenantPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="tenantEmail"
                  value={formData.tenantEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Occupation *</label>
                <input
                  type="text"
                  name="tenantOccupation"
                  value={formData.tenantOccupation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Lease Terms */}
          <div className="mb-8 pt-8 border-t">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Lease Terms</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent (RWF) *</label>
                <input
                  type="number"
                  name="monthlyRent"
                  value={formData.monthlyRent}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Security Deposit (RWF) *</label>
                <input
                  type="number"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Due Day (1-31) *</label>
                <select
                  name="paymentDueDay"
                  value={formData.paymentDueDay}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Additional Terms */}
          <div className="mb-8 pt-8 border-t">
            <div className="flex items-center gap-2 mb-4">
              <FileSignature className="h-6 w-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">Additional Terms</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Utilities Included</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Water', 'Electricity', 'Internet', 'Gas', 'Trash Collection', 'Security'].map(utility => (
                    <label key={utility} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.utilitiesIncluded.includes(utility)}
                        onChange={() => handleUtilitiesChange(utility)}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{utility}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Responsibility</label>
                  <select
                    name="maintenanceResponsibility"
                    value={formData.maintenanceResponsibility}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="landlord">Landlord (major repairs only)</option>
                    <option value="tenant">Tenant (all repairs)</option>
                    <option value="shared">Shared responsibility</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pet Policy</label>
                  <select
                    name="petPolicy"
                    value={formData.petPolicy}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="not-allowed">Not Allowed</option>
                    <option value="allowed">Allowed</option>
                    <option value="allowed-with-deposit">Allowed with Deposit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Terms or Conditions</label>
                <textarea
                  name="specialTerms"
                  value={formData.specialTerms}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Add any special terms, conditions, or clauses specific to this lease..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Link href="/properties" className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              Cancel
            </Link>
            <button
              onClick={handleGenerateLease}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 font-semibold"
            >
              <FileText className="h-5 w-5" />
              Generate Lease Agreement
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function for ordinal suffixes
function getOrdinalSuffix(num: number): string {
  const j = num % 10
  const k = num % 100
  if (j === 1 && k !== 11) return 'st'
  if (j === 2 && k !== 12) return 'nd'
  if (j === 3 && k !== 13) return 'rd'
  return 'th'
}

export default function NewContractPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <NewContractContent />
    </Suspense>
  )
}
