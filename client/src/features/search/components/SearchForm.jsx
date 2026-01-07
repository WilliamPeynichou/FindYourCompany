import React from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LocationAutocomplete } from './LocationAutocomplete';
import { RadiusSlider } from './RadiusSlider';
import { SectorSelect } from './SectorSelect';
import { MapPreview } from './MapPreview';
import { Button } from '../../../components/ui/Button';

const searchSchema = z.object({
  location: z.object({
    label: z.string()
      .max(200, "Le label est trop long")
      .refine(val => !/[<>\"']/.test(val), "Le label contient des caractères invalides"),
    lat: z.string()
      .refine(val => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= -90 && num <= 90;
      }, "La latitude doit être entre -90 et 90"),
    lon: z.string()
      .refine(val => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= -180 && num <= 180;
      }, "La longitude doit être entre -180 et 180"),
    city: z.string()
      .max(100, "Le nom de la ville est trop long")
      .regex(/^[a-zA-ZÀ-ÿ\s\-'\.]*$/, "Le nom de la ville contient des caractères invalides")
      .optional(),
    postcode: z.string()
      .regex(/^[0-9]{5}$|^$/, "Le code postal doit contenir 5 chiffres")
      .optional()
  }).nullable().refine(val => val !== null, "Veuillez choisir un lieu"),
  radius: z.number()
    .min(0, "Le rayon doit être positif")
    .max(200, "Le rayon ne peut pas dépasser 200 km"),
  sector: z.string()
    .max(100, "Le secteur est trop long")
    .regex(/^[a-zA-ZÀ-ÿ0-9\s\/\-\.]*$/, "Le secteur contient des caractères invalides")
    .optional()
});

export const SearchForm = ({ onSearch, loading }) => {
  const { control, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      location: null,
      radius: 50,
      sector: ""
    }
  });

  // On surveille les valeurs pour mettre à jour la carte en temps réel
  const location = useWatch({ control, name: "location" });
  const radius = useWatch({ control, name: "radius" });

  return (
    <form onSubmit={handleSubmit(onSearch)} className="max-w-xl mx-auto space-y-8 bg-white p-2 md:p-0">
      
      {/* 1. Sélection de la localisation */}
      <Controller
        name="location"
        control={control}
        render={({ field }) => (
          <LocationAutocomplete 
            value={field.value}
            onSelect={field.onChange} 
            error={errors.location?.message} 
          />
        )}
      />

      {location && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-8">
          {/* 2. Rayon de recherche */}
          <Controller
            name="radius"
            control={control}
            render={({ field }) => (
              <RadiusSlider 
                value={field.value} 
                onChange={field.onChange} 
              />
            )}
          />

          {/* 3. Carte de prévisualisation */}
          <MapPreview location={location} radius={radius} />

          {/* 4. Secteur d'activité */}
          <Controller
            name="sector"
            control={control}
            render={({ field }) => (
              <SectorSelect 
                value={field.value} 
                onChange={field.onChange} 
                error={errors.sector?.message} 
              />
            )}
          />

          <Button 
            type="submit" 
            className="w-full py-4 text-lg rounded-full"
            disabled={loading}
          >
            {loading ? "Recherche..." : "Rechercher les entreprises"}
          </Button>
        </div>
      )}
    </form>
  );
};
