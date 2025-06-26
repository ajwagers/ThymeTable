/*
  # Add Favorites and Saved Meal Plans

  1. New Tables
    - `favorite_recipes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `recipe_id` (integer, Spoonacular recipe ID)
      - `recipe_title` (text)
      - `recipe_image` (text, optional)
      - `recipe_data` (jsonb, stores full recipe details)
      - `created_at` (timestamp)
    
    - `saved_meal_plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, user-defined name for the meal plan)
      - `description` (text, optional)
      - `meal_plan_data` (jsonb, stores the complete week data)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create favorite_recipes table
CREATE TABLE IF NOT EXISTS favorite_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id integer NOT NULL,
  recipe_title text NOT NULL,
  recipe_image text,
  recipe_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create saved_meal_plans table
CREATE TABLE IF NOT EXISTS saved_meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  meal_plan_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE favorite_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_meal_plans ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_favorite_recipes_user_id ON favorite_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_recipes_recipe_id ON favorite_recipes(user_id, recipe_id);
CREATE INDEX IF NOT EXISTS idx_saved_meal_plans_user_id ON saved_meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_meal_plans_created_at ON saved_meal_plans(user_id, created_at DESC);

-- RLS Policies for favorite_recipes
CREATE POLICY "Users can view their own favorite recipes"
  ON favorite_recipes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorite recipes"
  ON favorite_recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite recipes"
  ON favorite_recipes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for saved_meal_plans
CREATE POLICY "Users can view their own saved meal plans"
  ON saved_meal_plans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved meal plans"
  ON saved_meal_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved meal plans"
  ON saved_meal_plans
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved meal plans"
  ON saved_meal_plans
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_saved_meal_plans_updated_at
  BEFORE UPDATE ON saved_meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();