"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, Sheet } from "@/components/ui/dialog";
import { Input, Select } from "@/components/ui/field";
import { ToastProvider, useToast } from "@/components/ui/toast";

function Demo() {
  const toast = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" onClick={() => setDialogOpen(true)}>
        Ouvrir la boîte de dialogue
      </Button>
      <Button variant="secondary" onClick={() => setSheetOpen(true)}>
        Ouvrir le tiroir des filtres
      </Button>
      <Button
        variant="ghost"
        onClick={() => toast({ title: "Ajouté au devis", description: "Pompe immergée inox 4\" — 1 unité" })}
      >
        Afficher une notification
      </Button>
      <Button
        variant="ghost"
        onClick={() =>
          toast({ tone: "error", title: "Envoi impossible", description: "Vérifiez votre connexion puis réessayez." })
        }
      >
        Notification d’erreur
      </Button>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Supprimer ce produit ?"
        description="Il disparaîtra du catalogue. Les demandes de devis déjà reçues sont conservées."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                setDialogOpen(false);
                toast({ title: "Produit supprimé" });
              }}
            >
              Supprimer
            </Button>
          </>
        }
      />

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filtrer le catalogue"
        footer={
          <Button fullWidth onClick={() => setSheetOpen(false)}>
            Voir les 11 produits
          </Button>
        }
      >
        <div className="grid gap-4">
          <Select label="Gamme" defaultValue="pompes">
            <option value="pompes">Pompes & motopompes</option>
            <option value="raccords">Raccords & fittings</option>
            <option value="kits">Kits complets</option>
          </Select>
          <Input label="Débit minimum" inputMode="decimal" placeholder="Ex. 8" hint="En m³/h" />
        </div>
      </Sheet>
    </div>
  );
}

export function InteractiveDemo() {
  return (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  );
}
