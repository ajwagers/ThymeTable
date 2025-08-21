/*
  # Create blog articles table and admin system

  1. New Tables
    - `blog_articles`
      - `id` (uuid, primary key)
      - `title` (text, article title)
      - `slug` (text, unique URL slug)
      - `excerpt` (text, optional preview text)
      - `content` (text, markdown content)
      - `author` (text, author name)
      - `published_date` (date, publication date)
      - `read_time` (text, estimated read time)
      - `category` (text, article category)
      - `tags` (text array, keywords)
      - `image_url` (text, optional main image)
      - `is_published` (boolean, draft/published status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `blog_articles` table
    - Add policy for public read access to published articles
    - Add policies for authenticated users to manage articles (admin functionality)

  3. Triggers
    - Auto-update `updated_at` timestamp on changes
</*/

-- Create blog_articles table
CREATE TABLE IF NOT EXISTS blog_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  author text NOT NULL DEFAULT 'Weekly Diet Planner Team',
  published_date date NOT NULL DEFAULT CURRENT_DATE,
  read_time text DEFAULT '5 min read',
  category text NOT NULL DEFAULT 'General',
  tags text[] DEFAULT '{}',
  image_url text,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;

-- Public can read published articles
CREATE POLICY "Anyone can read published articles"
  ON blog_articles
  FOR SELECT
  USING (is_published = true);

-- Authenticated users can manage articles (for admin functionality)
-- Note: In production, you should add proper admin role checking
CREATE POLICY "Authenticated users can insert articles"
  ON blog_articles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update articles"
  ON blog_articles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete articles"
  ON blog_articles
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_articles_updated_at
  BEFORE UPDATE ON blog_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_articles_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_articles_slug ON blog_articles (slug);
CREATE INDEX IF NOT EXISTS idx_blog_articles_published ON blog_articles (is_published, published_date DESC);
CREATE INDEX IF NOT EXISTS idx_blog_articles_category ON blog_articles (category, published_date DESC);

-- Insert the existing article as sample data
INSERT INTO blog_articles (
  title,
  slug,
  excerpt,
  content,
  author,
  published_date,
  read_time,
  category,
  tags,
  image_url,
  is_published
) VALUES (
  '10 Essential Tips for Meal Planning with Food Allergies',
  'food-allergy-meal-planning',
  'Managing food allergies doesn''t have to make meal planning overwhelming. Learn our top strategies for creating safe, delicious weekly meal plans that work for your family.',
  '# **10 Essential Tips for Meal Planning with Food Allergies**

**Summary:** Managing food allergies doesn''t have to make meal planning overwhelming. Learn our top strategies for creating safe, delicious weekly meal plans that work for your family.

![Family meal planning with fresh ingredients and allergen-free foods on a kitchen counter](https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800)

---

Living with food allergies requires diligence. Careful planning can help reduce the stress. A restrictive diet doesn''t mean sacrificing flavor or variety in your meals. With the right strategies, you can create weekly meal plans that are both safe and satisfying for your entire family. Here are ten essential tips to streamline your allergy-friendly meal planning process.

## 1. **Start with a Master List of Safe Foods**

Create a comprehensive list of ingredients and foods that are safe for your specific allergies. This becomes your foundation for all meal planning decisions. Include proteins, grains, vegetables, fruits, seasonings, and pantry staples that you know are safe. Keep this list handy when grocery shopping or trying new recipes.

## 2. **Master the Art of Label Reading**

Always read ingredient labels carefully, **even on products you''ve purchased before**, as manufacturers can change formulations without notice. Look for allergen statements like "Contains:" or "May contain:" and be aware of alternative names for your allergens. When in doubt, contact the manufacturer directly.

*Reference: The FDA requires clear allergen labeling for the top 9 allergens: milk, eggs, fish, shellfish, tree nuts, peanuts, wheat, soybeans, and sesame.* https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/food-allergies 

## 3. **Prevent Cross-Contact in Your Kitchen**

Cross-contact occurs when an allergen is accidentally transferred from one food to another. Use separate cutting boards, utensils, and storage containers for allergen-free foods. Clean surfaces thoroughly between food preparation, and consider designating specific areas of your kitchen as allergen-free zones. Consider removing the allergen completely from your families entire diet if possible.

*Reference: FoodAllergy.org and Food Allergy Canada provide comprehensive guidelines on preventing cross-contact at home.* https://www.foodallergy.org/resources/creating-food-allergy-safety-zone-your-home-booklet (PDF)

## 4. **Batch Cook and Prep Safe Staples**

Prepare large batches of safe, basic ingredients like grains, proteins, and sauces that can be used throughout the week. This saves time and ensures you always have allergy-friendly components ready for quick meal assembly. Store these in clearly labeled, dedicated containers. Another option is to batch cook several meals worth and freeze the extra meals for a later date. Cook once, eat more.

## 5. **Plan for Substitutions**

Learn reliable substitutions for common allergens in your favorite recipes. For example, if avoiding eggs, research options like flax eggs, aquafaba, or commercial egg replacers. Keep a substitution cheat sheet accessible for quick reference when meal planning or cooking. This may take some experimentation on your part. Use a substitute in your favorite recipe and depending on how it turns out either adjust the amounts or try a different substitute. Don''t be afraid of failures, learn and improve.

*Reference: Reputable allergy organizations like Kids with Food Allergies provide extensive substitution guides for common allergens.* https://kidswithfoodallergies.org/recipes-diet/recipe-substitutions/

## 6. **Create Theme Nights to Simplify Planning**

Establish weekly themes like "Taco Tuesday" or "Stir-Fry Friday" using ingredients you know are safe. This reduces decision fatigue while ensuring variety. You can rotate different proteins, vegetables, and seasonings within each theme to keep meals interesting.

## 7. **Build Relationships with Local Suppliers**

Connect with local farmers, butchers, and specialty food stores that understand food allergies. They can often provide detailed information about their products and may even source specific allergy-friendly items for you. This expands your options while maintaining safety. You may also be able to request a certain product if they don''t regularly have it. If they know there is interest, they may keep it on the shelf. You could also partner with other families to buy in bulk saving everyone money. Also, check out food co-ops and CSAs for other sources of fresh and hard-to-find products.

## 8. **Keep Emergency Backup Meals Ready**

Always have a few simple, safe meals that can be prepared quickly when plans change. This might include frozen allergy-friendly meals (see #4 above), pantry staples that combine into a quick dish, or pre-portioned ingredients for a go-to recipe. This prevents the stress of last-minute meal decisions. It helps if these are quick and simple meals like pancakes, or tacos.

## 9. **Involve the Whole Family**

Meal planning with food allergies can help you feel more organized and better able to manage your allergies. Teach family members about safe ingredients and involve them in meal planning discussions. This ensures everyone understands the importance of food safety and can contribute ideas for new meals to try. Let younger kids help in the kitchen preparing food and guiding them in food safety.

## 10. **Document What Works**

Keep a record of successful meals, including recipes, shopping lists, and prep notes. This creates a personalized database of family-approved options that you can rotate through or modify. Note any reactions or concerns to refine your safe food list over time. This website, http://weeklydietplanner.app is perfect for this. Our tool allows you to save favorite recipes and even save a weekly meal plan to reuse in the future.

---

## Additional Resources

- **Food Allergy Research & Education (FARE)**: Comprehensive resources for managing food allergies (https://www.foodallergy.org/)
- **Food Allergy Canada**: Canadian-specific guidance and support (https://foodallergycanada.ca/)
- **Kids with Food Allergies**: Practical tips and community support (https://kidswithfoodallergies.org/)
- **Your healthcare provider**: Always consult with allergists or dietitians for personalized advice

## The Bottom Line

Meal planning with food allergies can be challenging, but it becomes manageable with the right strategies. Remember that it takes time to develop efficient systems, so be patient with yourself as you learn. Focus on building a foundation of safe, enjoyable meals that your family loves, and gradually expand your repertoire as you become more confident. Take it one step at a time, don''t try to change everything all at once.

With careful planning and these practical strategies, you can create delicious, varied meal plans that keep everyone safe and satisfied. The key is preparation, organization, and maintaining a positive attitude about the creative possibilities within your dietary requirements.',
  'Weekly Diet Planner Team',
  '2025-01-15',
  '8 min read',
  'Food Allergies',
  ARRAY['food allergies', 'meal planning', 'safety', 'tips', 'family nutrition'],
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
  true
) ON CONFLICT (slug) DO NOTHING;