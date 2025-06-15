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
import { Printer, Download, CheckSquare, Languages } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LeaseAgreementViewProps {
  propertyName: string;
  propertyAddress: string;
  // In a real app, more lease details would be passed or fetched
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
Landlord                         Tenant
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
Propriétaire                     Locataire
`,
  },
  kinyarwanda: {
    title: "Amasezerano y'Ubucuruzi bw'Inzu yo Guturamo",
    content: `Aya Masezerano y'Ubucuruzi bw'Inzu yo Guturamo ("Amasezerano") yakozwe kandi yemejwe kuri uyu munsi wa [Itariki] hagati ya [Izina rya Nyir'inzu] ("Nyir'inzu") na [Amazina y'Umukode] ("Umukode").

1.  **Inzu:** Nyir'inzu yemeye gukodesha Umukode, n'Umukode yemeye gukodesha kwa Nyir'inzu, inzu iherereye kuri: ${"{propertyAddress}"} ("Inzu").
2.  **Igihe:** Igihe cy'aya masezerano kizaba [Igihe cy'Amasezerano, urugero: amezi 12], guhera ku [Itariki yo Gutangira] kugeza ku [Itariki yo Kurangiza].
3.  **Ubukode:** Umukode azajya yishyura Nyir'inzu ubukode bwa buri kwezi bungana na [Amafaranga y'Ubukode] [Ifaranga], yishyurwa mbere ku munsi wa mbere wa buri kwezi.
4.  **Ingwate:** Mu gihe cyo gusinya aya Masezerano, Umukode azashyikiriza Nyir'inzu amafaranga angana na [Amafaranga y'Ingwate] [Ifaranga] nk'ingwate y'uko Umukode azubahiriza neza buri ngingo, ibisabwa, n'amasezerano yose ari muri aya Masezerano.
... (izindi ngingo zerekeye ikoreshwa ry'inzu, isuku, amazi n'amashanyarazi, amakosa, n'ibindi) ...
MU KWEMEZA IBI, impande zombi zashyize umukono kuri aya Masezerano ku itariki yavuzwe haruguru.

_________________________        _________________________
Nyir'inzu                        Umukode
`,
  },
};

export default function LeaseAgreementView({ propertyName, propertyAddress }: LeaseAgreementViewProps) {
  const [language, setLanguage] = useState('english');
  const [currentLeaseText, setCurrentLeaseText] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const rawText = leaseTexts[language]?.content || leaseTexts['english'].content;
    setCurrentLeaseText(rawText.replace('${"{propertyAddress}"}', propertyAddress));
  }, [language, propertyAddress]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Basic text download
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
    // Placeholder for e-signature integration
    toast({ title: "E-Signature", description: "Electronic signature process would start here (not implemented)." });
  };


  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl">
      <CardHeader className="border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-headline text-primary">
              {leaseTexts[language]?.title || leaseTexts['english'].title}
            </CardTitle>
            <CardDescription>For property: {propertyName}</CardDescription>
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
          <pre className="whitespace-pre-wrap text-sm leading-relaxed font-body">
            {currentLeaseText}
          </pre>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t pt-6">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
        <Button size="lg" onClick={handleSignElectronically} className="w-full sm:w-auto">
          <CheckSquare className="mr-2 h-4 w-4" /> Sign Electronically
        </Button>
      </CardFooter>
    </Card>
  );
}
