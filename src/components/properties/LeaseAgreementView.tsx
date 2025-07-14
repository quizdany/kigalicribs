
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Printer, Download, CheckSquare, Languages, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

interface LeaseAgreementViewProps {
  propertyName: string;
  propertyAddress: string;
}

const leaseTexts: Record<string, Record<string, string>> = {
  english: {
    title: "Residential Lease Agreement",
    content: `This Residential Lease Agreement ("Agreement") is made and entered into this [Date] by and between [Landlord Name] ("Landlord") and [Tenant Name(s)] ("Tenant").

1.  **Property:** Landlord agrees to lease to Tenant, and Tenant agrees to lease from Landlord, the premises located at: ${"{propertyAddress}"} (the "Premises").
2.  **Term:** The term of this lease shall be for a period of [Lease Term, e.g., 12 months], commencing on [Start Date] and ending on [End Date].
3.  **Rent:** Tenant shall pay Landlord a monthly rent of [Rent Amount] [Currency], payable in advance on the first day of each month.
4.  **Security Deposit:** Upon execution of this Agreement, Tenant shall deposit with Landlord the sum of [Security Deposit Amount] [Currency] as security for the full and faithful performance by Tenant of every term, condition, and covenant of this Agreement.
... (more clauses on use of premises, maintenance, utilities, default, etc.) ...
IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.

_________________________        _________________________
Landlord                         Tenant (Electronically Signed)
`,
  },
  french: {
    title: "Contrat de Location Résidentielle",
    content: `Le présent Contrat de Location Résidentielle ("Contrat") est conclu et prend effet ce [Date] par et entre [Nom du Propriétaire] ("Propriétaire") et [Nom du/des Locataire(s)] ("Locataire").

1.  **Propriété :** Le Propriétaire s'engage à louer au Locataire, et le Locataire s'engage à louer auprès du Propriétaire, les lieux situés à : ${"{propertyAddress}"} (les "Lieux").
2.  **Durée :** La durée de ce bail sera d'une période de [Durée du Bail, ex: 12 mois], commençant le [Date de Début] et se terminant le [Date de Fin].
3.  **Loyer :** Le Locataire paiera au Propriétaire un loyer mensuel de [Montant du Loyer] [Devise], payable d'avance le premier jour de chaque mois.
4.  **Dépôt de Garantie :** Dès l'exécution de ce Contrat, le Locataire déposera auprès du Propriétaire la somme de [Montant du Dépôt de Garantie] [Devise] à titre de garantie pour l'exécution pleine et fidèle par le Locataire de chaque terme, condition et engagement de ce Contrat.
... (plus de clauses sur l'utilisation des lieux, l'entretien, les services publics, le défaut, etc.) ...
EN FOI DE QUOI, les parties ont exécuté ce Contrat à la date mentionnée ci-dessus.

_________________________        _________________________
Propriétaire                     Locataire (Signé Électroniquement)
`,
  },
  kinyarwanda: {
    title: "Amasezerano y'ubukode bw'inzu yo Guturamo",
    content: `Aya Masezerano y'ubukode bw'inzu yo Guturamo ("Amasezerano") yakozwe kandi yemejwe kuri uyu munsi wa [Itariki] hagati ya [Izina rya Nyir'inzu] ("Nyir'inzu") na [Amazina y'Ukodesha] ("Ukodesha").

1.  **Inzu:** Nyir'inzu yemeye gukodesha Ukodesha, n'Ukodesha yemeye gukodesha kwa Nyir'inzu, inzu iherereye kuri: ${"{propertyAddress}"} ("Inzu").
2.  **Igihe:** Igihe cy'aya masezerano kizaba [Igihe cy'Amasezerano, urugero: amezi 12], guhera ku [Itariki yo Gutangira] kugeza ku [Itariki yo Kurangiza].
3.  **Ubukode:** Ukodesha azajya yishyura Nyir'inzu ubukode bwa buri kwezi bungana na [Amafaranga y'Ubukode] [Ifaranga], yishyurwa mbere ku munsi wa mbere wa buri kwezi.
4.  **Kosiyo:** Mu gihe cyo gusinya aya Masezerano, Ukodesha azashyikiriza Nyir'inzu amafaranga angana na [Amafaranga ya Kosiyo] [Ifaranga] nk'ingwate y'uko Ukodesha azubahiriza neza buri ngingo, ibisabwa, n'amasezerano yose ari muri aya Masezerano.
... (izindi ngingo zerekeye ikoreshwa ry'inzu, isuku, amazi n'amashanyarazi, amakosa, n'ibindi) ...
MU KWEMEZA IBI, impande zombi zashyize umukono kuri aya Masezerano ku itariki yavuzwe haruguru.

_________________________        _________________________
Nyir'inzu                        Ukodesha (Yashyizeho Umukono mu Buryo bw'Ikoranabuhanga)
`,
  },
};

// Helper for money formatting
const formatMoney = (amount: string | number, currency: string) => {
  if (!amount) return '';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US', { minimumFractionDigits: 0 }) + ' ' + (currency === 'USD' ? 'USD' : 'Rwf');
};

export default function LeaseAgreementView({ propertyName, propertyAddress }: LeaseAgreementViewProps) {
  const [language, setLanguage] = useState('english');
  const [currentLeaseText, setCurrentLeaseText] = useState('');
  const { toast } = useToast();
  const [isSigned, setIsSigned] = useState(false);
  const [signedDate, setSignedDate] = useState<Date | null>(null);
  const [step, setStep] = useState(1);

  // Lease form state
  const [form, setForm] = useState({
    tenantName: '',
    tenantId: '',
    tenantContact: '',
    landlordName: '',
    landlordId: '',
    landlordContact: '',
    monthlyPayment: '',
    paymentDeadline: '',
    downPayment: '',
    leaseDuration: '',
    leaseStartDate: '',
    currency: 'RWF',
    propertyDistrict: '',
    propertySector: '',
    propertyCell: '',
    propertyVillage: '',
  });

  // Update lease text with form values
  useEffect(() => {
    if (step !== 2) return;
    let rawText = leaseTexts[language]?.content || leaseTexts['english'].content;
    rawText = rawText
      .replace('${"{propertyAddress}"}', propertyAddress)
      .replace('[Tenant Name(s)]', form.tenantName || '[Tenant Name(s)]')
      .replace('[Tenant ID]', form.tenantId || '[Tenant ID]')
      .replace('[Tenant Contact]', form.tenantContact || '[Tenant Contact]')
      .replace('[Landlord Name]', form.landlordName || '[Landlord Name]')
      .replace('[Landlord ID]', form.landlordId || '[Landlord ID]')
      .replace('[Landlord Contact]', form.landlordContact || '[Landlord Contact]')
      .replace('[Rent Amount]', form.monthlyPayment || '[Rent Amount]')
      .replace('[Currency]', form.currency)
      .replace('[Lease Term, e.g., 12 months]', form.leaseDuration ? `${form.leaseDuration} months` : '[Lease Term, e.g., 12 months]')
      .replace('[Start Date]', form.leaseStartDate ? format(new Date(form.leaseStartDate), 'yyyy-MM-dd') : '[Start Date]')
      .replace('[End Date]', (form.leaseStartDate && form.leaseDuration) ? format(new Date(new Date(form.leaseStartDate).setMonth(new Date(form.leaseStartDate).getMonth() + Number(form.leaseDuration))), 'yyyy-MM-dd') : '[End Date]')
      .replace('[Security Deposit Amount]', form.downPayment || '[Security Deposit Amount]')
      .replace('[Property District]', form.propertyDistrict || '[Property District]')
      .replace('[Property Sector]', form.propertySector || '[Property Sector]')
      .replace('[Property Cell]', form.propertyCell || '[Property Cell]')
      .replace('[Property Village]', form.propertyVillage || '[Property Village]');
    setCurrentLeaseText(rawText);
  }, [language, propertyAddress, step, form]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([currentLeaseText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Lease_Agreement_${propertyName.replace(/\s+/g, '_')}_${language}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({ title: "Download Started", description: "Lease agreement download has started." });
  };

  const handleSignElectronically = () => {
    setIsSigned(true);
    setSignedDate(new Date());
    toast({ 
      title: "Lease Signed Electronically", 
      description: `You have signed the lease for ${propertyName}. A confirmation has been sent to your email (simulated).`
    });
  };

  // Form handlers
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  // Step 1: Interactive form
  if (step === 1) {
    return (
      <Card className="w-full max-w-xl mx-auto shadow-2xl">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-headline text-primary">Lease Agreement Details</CardTitle>
          <CardDescription>Fill in the details to personalize your lease agreement.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Tenant Info */}
            <div>
              <div className="font-semibold mb-2 text-primary">Tenant Information</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Tenant Name</Label>
                  <Input name="tenantName" value={form.tenantName} onChange={handleFormChange} required />
                </div>
                <div>
                  <Label>National ID/Passport</Label>
                  <Input name="tenantId" value={form.tenantId} onChange={handleFormChange} required />
                </div>
                <div>
                  <Label>Contact (Phone/Email)</Label>
                  <Input name="tenantContact" value={form.tenantContact} onChange={handleFormChange} required />
                </div>
              </div>
            </div>
            {/* Landlord Info */}
            <div>
              <div className="font-semibold mb-2 text-primary">Landlord Information</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Landlord Name</Label>
                  <Input name="landlordName" value={form.landlordName} onChange={handleFormChange} required />
                </div>
                <div>
                  <Label>National ID/Passport</Label>
                  <Input name="landlordId" value={form.landlordId} onChange={handleFormChange} required />
                </div>
                <div>
                  <Label>Contact (Phone/Email)</Label>
                  <Input name="landlordContact" value={form.landlordContact} onChange={handleFormChange} required />
                </div>
              </div>
            </div>
            {/* Property Location Info */}
            <div>
              <div className="font-semibold mb-2 text-primary">Property Location</div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>District</Label>
                  <Input name="propertyDistrict" value={form.propertyDistrict} onChange={handleFormChange} required />
                </div>
                <div>
                  <Label>Sector</Label>
                  <Input name="propertySector" value={form.propertySector} onChange={handleFormChange} required />
                </div>
                <div>
                  <Label>Cell</Label>
                  <Input name="propertyCell" value={form.propertyCell} onChange={handleFormChange} required />
                </div>
                <div>
                  <Label>Village</Label>
                  <Input name="propertyVillage" value={form.propertyVillage} onChange={handleFormChange} required />
                </div>
              </div>
            </div>
            {/* Lease/Payment Info */}
            <div>
              <div className="font-semibold mb-2 text-primary">Lease & Payment Details</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Agreed Monthly Payment</Label>
                  <Input name="monthlyPayment" type="number" min="0" value={form.monthlyPayment} onChange={handleFormChange} required />
                </div>
                <div>
                  <Label>Currency</Label>
                  <select name="currency" value={form.currency} onChange={handleFormChange} className="w-full border rounded h-10 px-2">
                    <option value="RWF">RWF</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <Label>Payment Deadline</Label>
                  <select name="paymentDeadline" value={form.paymentDeadline} onChange={handleFormChange} className="w-full border rounded h-10 px-2" required>
                    <option value="">Select Day</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{i + 1}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Down Payment</Label>
                  <Input name="downPayment" type="number" min="0" value={form.downPayment} onChange={handleFormChange} required />
                </div>
                <div>
                  <Label>Lease Duration (months)</Label>
                  <Input name="leaseDuration" type="number" min="1" value={form.leaseDuration} onChange={handleFormChange} required />
                </div>
                <div>
                  <Label>Lease Start Date</Label>
                  <Input name="leaseStartDate" type="date" value={form.leaseStartDate} onChange={handleFormChange} required />
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full mt-4">Generate Lease Agreement</Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Step 2: Show agreement and allow signing
  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl">
      <CardHeader className="border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="w-full">
            <CardTitle className="text-2xl font-headline text-center mb-2">{leaseTexts[language]?.title || leaseTexts['english'].title}</CardTitle>
            <CardDescription className="text-center mb-4">For property: {propertyName}</CardDescription>
            <div className="w-full max-w-2xl mx-auto flex flex-col gap-1 text-base">
              {/* Tenant Info */}
              <div className="font-bold">Tenant</div>
              <div>Full Name: {form.tenantName}</div>
              <div>ID/Passport: {form.tenantId}</div>
              <div>Contact: <span className="font-mono">{form.tenantContact}</span></div>
              <div className="h-4" /> {/* Spacer line */}
              {/* Landlord Info */}
              <div className="font-bold">Landlord</div>
              <div>Full Name: {form.landlordName}</div>
              <div>ID/Passport: {form.landlordId}</div>
              <div>Contact: <span className="font-mono">{form.landlordContact}</span></div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Languages className="h-5 w-5 text-muted-foreground"/>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="french">Français</SelectItem>
                <SelectItem value="kinyarwanda">Kinyarwanda</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ScrollArea className="h-[500px] w-full border rounded-md p-4 bg-background">
          {/* Agreement body */}
          <div className="max-w-3xl mx-auto px-2">
            <div className="mb-6 text-2xl font-extrabold text-center tracking-tight">Residential Lease Agreement</div>
            <p className="mb-6 text-base text-foreground/90 text-justify w-full">
              This Residential Lease Agreement ("Agreement") is made and entered into this {form.leaseStartDate ? format(new Date(form.leaseStartDate), 'yyyy-MM-dd') : '[Start Date]'} by and between {form.landlordName || '[Landlord Name]'} ("Landlord") and {form.tenantName || '[Tenant Name]'} ("Tenant"). By signing below, both parties acknowledge and agree that this Agreement is legally binding and enforceable in accordance with applicable law.
            </p>
            {/* Reformatted numbered points in two-column layout */}
            <div className="space-y-6">
              {/* 1 */}
              <div className="flex flex-col md:flex-row md:items-start md:gap-4">
                <div className="md:w-1/5 font-bold flex-shrink-0 flex items-start"><span>1.</span> <span className="ml-2">Property</span></div>
                <div className="md:w-4/5 text-base text-foreground/90">
                  Landlord agrees to lease to Tenant, and Tenant agrees to lease from Landlord, the premises located at <span className="font-semibold">{propertyAddress}</span> ({form.propertyDistrict}, {form.propertySector}, {form.propertyCell}, {form.propertyVillage}).
                </div>
              </div>
              {/* 2 */}
              <div className="flex flex-col md:flex-row md:items-start md:gap-4">
                <div className="md:w-1/5 font-bold flex-shrink-0 flex items-start"><span>2.</span> <span className="ml-2">Term</span></div>
                <div className="md:w-4/5 text-base text-foreground/90">
                  The term of this lease shall be for a period of <span className="font-semibold">{form.leaseDuration} months</span>, commencing on <span className="font-semibold">{form.leaseStartDate}</span> and ending on <span className="font-semibold">{form.leaseStartDate && form.leaseDuration ? format(new Date(new Date(form.leaseStartDate).setMonth(new Date(form.leaseStartDate).getMonth() + Number(form.leaseDuration))), 'yyyy-MM-dd') : '[End Date]'}</span>.
                </div>
              </div>
              {/* 3 */}
              <div className="flex flex-col md:flex-row md:items-start md:gap-4">
                <div className="md:w-1/5 font-bold flex-shrink-0 flex items-start"><span>3.</span> <span className="ml-2">Rent</span></div>
                <div className="md:w-4/5 text-base text-foreground/90">
                  Tenant shall pay Landlord a monthly rent of <span className="font-semibold">{formatMoney(form.monthlyPayment, form.currency)}</span>, payable in advance on the <span className="font-semibold">{form.paymentDeadline}</span> day of each month.
                </div>
              </div>
              {/* 4 */}
              <div className="flex flex-col md:flex-row md:items-start md:gap-4">
                <div className="md:w-1/5 font-bold flex-shrink-0 flex items-start"><span>4.</span> <span className="ml-2">Security Deposit</span></div>
                <div className="md:w-4/5 text-base text-foreground/90">
                  Upon execution of this Agreement, Tenant shall deposit with Landlord the sum of <span className="font-semibold">{formatMoney(form.downPayment, form.currency)}</span> as security for the full and faithful performance by Tenant of every term, condition, and covenant of this Agreement.
                </div>
              </div>
              {/* 5 */}
              <div className="flex flex-col md:flex-row md:items-start md:gap-4">
                <div className="md:w-1/5 font-bold flex-shrink-0 flex items-start"><span>5.</span> <span className="ml-2">Other Terms</span></div>
                <div className="md:w-4/5 text-base text-foreground/90">
                  ... (more clauses on use of premises, maintenance, utilities, default, etc.) ...
                </div>
              </div>
            </div>
            <div className="mt-10 text-center text-base text-foreground/80">
              IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.
            </div>
            <div className="flex flex-col md:flex-row gap-12 mt-12 items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="w-56 border-b-2 border-muted-foreground mb-2"></div>
                <div className="text-sm text-muted-foreground">Landlord</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-56 border-b-2 border-muted-foreground mb-2"></div>
                <div className="text-sm text-muted-foreground">Tenant {isSigned && signedDate ? '(Electronically Signed)' : ''}</div>
              </div>
            </div>
          </div>
        </ScrollArea>
         {isSigned && signedDate && (
          <Alert variant="default" className="mt-6 bg-green-50 border-green-300">
            <CheckSquare className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-700">Lease Signed Electronically</AlertTitle>
            <AlertDescription className="text-green-600">
              This lease agreement was electronically signed by {form.tenantName} on {signedDate.toLocaleDateString()}.
              A copy has been notionally sent to your registered email address.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t pt-6">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} disabled={!isSigned}>
            <Printer className="mr-2 h-4 w-4" /> Print Signed Lease
          </Button>
          <Button variant="outline" onClick={handleDownload} disabled={!isSigned}>
            <Download className="mr-2 h-4 w-4" /> Download Signed Lease
          </Button>
        </div>
        <Button 
          size="lg" 
          onClick={handleSignElectronically} 
          className="w-full sm:w-auto"
          disabled={isSigned}
        >
          <CheckSquare className="mr-2 h-4 w-4" /> 
          {isSigned ? 'Signed' : 'Sign Electronically'}
        </Button>
      </CardFooter>
    </Card>
  );
}

