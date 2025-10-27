"use client"

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { FileText, Download, Printer, Mail, CheckCircle, Calendar, Home, User, DollarSign, FileSignature } from 'lucide-react'

function NewContractContent() {
  const params = useSearchParams()
  const propertyId = params.get('propertyId')
  const [property, setProperty] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [step, setStep] = useState<'form' | 'preview' | 'sign'>('form')
  const [language, setLanguage] = useState<'english' | 'kinyarwanda'>('english')
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
      // Pre-fill landlord info
      setFormData(prev => ({
        ...prev,
        landlordEmail: session.user.email || '',
      }))
    }
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
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
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
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                  <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>

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
                    {language === 'english' ? 'LANDLORD (Lessor)' : 'NYIR\'INZU (Ukodesha)'}
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
                    {language === 'english' ? 'TENANT (Lessee)' : 'UPAKIRA (Ukodeshwa)'}
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
              <h2 className="text-xl font-bold text-gray-800 mb-4">LEASE TERMS</h2>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <p><span className="font-medium">Lease Start Date:</span> {new Date(formData.startDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Lease End Date:</span> {new Date(formData.endDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Monthly Rent:</span> {parseInt(formData.monthlyRent).toLocaleString()} RWF</p>
                  <p><span className="font-medium">Security Deposit:</span> {parseInt(formData.securityDeposit).toLocaleString()} RWF</p>
                  <p><span className="font-medium">Payment Due:</span> Day {formData.paymentDueDay} of each month</p>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">TERMS AND CONDITIONS</h2>
              
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">1. RENT PAYMENT</h3>
                  <p className="ml-4 leading-relaxed">
                    The Tenant agrees to pay rent of <span className="font-semibold">{parseInt(formData.monthlyRent).toLocaleString()} RWF</span> per month, 
                    due on the <span className="font-semibold">{formData.paymentDueDay}{getOrdinalSuffix(parseInt(formData.paymentDueDay))}</span> day of each month. 
                    Payment shall be made via bank transfer, mobile money, or as otherwise agreed upon by both parties.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">2. SECURITY DEPOSIT</h3>
                  <p className="ml-4 leading-relaxed">
                    The Tenant has paid a security deposit of <span className="font-semibold">{parseInt(formData.securityDeposit).toLocaleString()} RWF</span>. 
                    This deposit will be refunded within 14 days after the lease termination, subject to deductions for any damages beyond normal wear and tear, 
                    unpaid rent, or other breaches of this agreement.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">3. UTILITIES</h3>
                  <p className="ml-4 leading-relaxed">
                    {formData.utilitiesIncluded.length > 0 ? (
                      <>The following utilities are included in the rent: {formData.utilitiesIncluded.join(', ')}. 
                      All other utilities shall be the responsibility of the Tenant.</>
                    ) : (
                      <>All utilities including water, electricity, internet, and other services are the responsibility of the Tenant 
                      and shall be paid directly to the respective service providers.</>
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">4. MAINTENANCE AND REPAIRS</h3>
                  <p className="ml-4 leading-relaxed">
                    {formData.maintenanceResponsibility === 'landlord' ? (
                      <>The Landlord is responsible for major repairs and maintenance of the property's structure, plumbing, and electrical systems. 
                      The Tenant is responsible for minor repairs and keeping the property in good condition.</>
                    ) : (
                      <>The Tenant is responsible for all maintenance and repairs during the lease period, except for structural issues 
                      which remain the Landlord's responsibility.</>
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">5. USE OF PREMISES</h3>
                  <p className="ml-4 leading-relaxed">
                    The property shall be used solely for residential purposes. The Tenant shall not use the premises for any illegal activities 
                    or purposes that violate Rwandan law.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">6. PETS POLICY</h3>
                  <p className="ml-4 leading-relaxed">
                    {formData.petPolicy === 'allowed' ? 'Pets are allowed on the premises with prior written consent from the Landlord.' : 
                    formData.petPolicy === 'allowed-with-deposit' ? 'Pets are allowed with an additional deposit and prior written consent from the Landlord.' : 'No pets are allowed on the premises without prior written consent from the Landlord.'}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">7. TERMINATION</h3>
                  <p className="ml-4 leading-relaxed">
                    Either party may terminate this agreement with 30 days written notice. Early termination by the Tenant without proper notice 
                    may result in forfeiture of the security deposit. The Landlord reserves the right to terminate immediately for breach of agreement.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">8. PROPERTY INSPECTION</h3>
                  <p className="ml-4 leading-relaxed">
                    The Landlord reserves the right to inspect the property with 24 hours notice to the Tenant, during reasonable hours.
                  </p>
                </div>

                {formData.specialTerms && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">9. SPECIAL TERMS</h3>
                    <p className="ml-4 leading-relaxed whitespace-pre-wrap">{formData.specialTerms}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Agreement Clause */}
            <div className="mb-12 bg-green-50 border-l-4 border-green-600 p-4">
              <p className="text-sm leading-relaxed">
                Both parties have read and understood all terms of this agreement and agree to be bound by them. 
                This agreement is governed by the laws of the Republic of Rwanda.
              </p>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">LANDLORD'S SIGNATURE</h3>
                <div className="border-b-2 border-black mb-2 h-16"></div>
                <p className="text-sm">Name: {formData.landlordName}</p>
                <p className="text-sm">Date: _____________________</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-4">TENANT'S SIGNATURE</h3>
                <div className="border-b-2 border-black mb-2 h-16"></div>
                <p className="text-sm">Name: {formData.tenantName}</p>
                <p className="text-sm">Date: _____________________</p>
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
                <button onClick={() => setStep('sign')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <FileSignature className="h-5 w-5" />
                  {language === 'english' ? 'Sign Agreement' : 'Shyira Umukono'}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setStep('preview')} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  {language === 'english' ? 'Back to Preview' : 'Subira Kureba'}
                </button>
                <button onClick={handlePrint} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Printer className="h-5 w-5" />
                  {language === 'english' ? 'Print Agreement' : 'Icapira Amasezerano'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-semibold"
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
