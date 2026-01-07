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
    label: z.string(),
    lat: z.string(),
    lon: z.string(),
    city: z.string().optional(),
    postcode: z.string().optional()
  }).nullable().refine(val => val !== null, "Veuillez choisir un lieu"),
  radius: z.number().min(0).max(200),
  sector: z.string().optional()
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
