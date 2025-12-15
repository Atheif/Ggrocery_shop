-- Create categories table in Supabase
CREATE TABLE public.categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL,
    description TEXT NOT NULL,
    background_image TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON public.categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policy to allow read access for everyone
CREATE POLICY "Allow read access for everyone" ON public.categories
    FOR SELECT USING (true);

-- Insert default categories
INSERT INTO public.categories (name, emoji, description, background_image) VALUES
('Fruits', '🍎', 'Apples, Bananas, Oranges', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400'),
('Vegetables', '🥕', 'Carrots, Broccoli, Spinach', 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400'),
('Dairy', '🥛', 'Milk, Cheese, Yogurt', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'),
('Bakery', '🍞', 'Bread, Pastries, Cakes', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'),
('Meat', '🥩', 'Chicken, Beef, Pork', 'https://images.unsplash.com/photo-1588348845815-9d1c1d0d9d1f?w=400'),
('Seafood', '🐟', 'Fish, Shrimp, Salmon', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'),
('Beverages', '🥤', 'Juice, Soda, Water', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'),
('Snacks', '🍿', 'Chips, Nuts, Crackers', 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400');