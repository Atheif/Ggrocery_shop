    -- Add offer fields to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS offer_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS offer_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS offer_end_date TIMESTAMP WITH TIME ZONE;

-- Add comment to columns
COMMENT ON COLUMN public.products.offer_percentage IS 'Discount percentage (0-100)';
COMMENT ON COLUMN public.products.offer_active IS 'Whether the offer is currently active';
COMMENT ON COLUMN public.products.offer_end_date IS 'When the offer expires';
