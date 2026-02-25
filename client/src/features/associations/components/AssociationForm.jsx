import React from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LocationAutocomplete } from '../../search/components/LocationAutocomplete';
import { RadiusSlider } from '../../search/components/RadiusSlider';
import { MapPreview } from '../../search/components/MapPreview';
import { AssociationDomainSelect } from './AssociationDomainSelect';
import { Button } from '../../../components/ui/Button';

const associationSchema = z.object({
  location: z.object({
    label: z.string()
      .max(200, "Le label est trop long")
      .refine(val => !/[<>"']/.test(val), "Le label contient des caractères invalides"),
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
    city: z.string().max(100).optional(),
    postcode: z.string().regex(/^[0-9]{5}$|^$/).optional()
  }).nullable().refine(val => val !== null, "Veuillez choisir un lieu"),
  radius: z.number().min(0).max(200),
  domain: z.string().optional()
});

export const AssociationForm = ({ onSearch, loading }) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(associationSchema),
    defaultValues: {
      location: null,
      radius: 10,
      domain: ''
    }
  });

  const location = useWatch({ control, name: 'location' });
  const radius = useWatch({ control, name: 'radius' });

  return (
    <form onSubmit={handleSubmit(onSearch)} className="max-w-xl mx-auto space-y-8 bg-white p-2 md:p-0">
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
          <Controller
            name="radius"
            control={control}
            render={({ field }) => (
              <RadiusSlider value={field.value} onChange={field.onChange} />
            )}
          />

          <MapPreview location={location} radius={radius} />

          <Controller
            name="domain"
            control={control}
            render={({ field }) => (
              <AssociationDomainSelect value={field.value} onChange={field.onChange} />
            )}
          />

          <Button
            type="submit"
            className="w-full py-4 text-lg rounded-full"
            disabled={loading}
          >
            {loading ? 'Recherche...' : 'Rechercher des associations'}
          </Button>
        </div>
      )}
    </form>
  );
};
