
-- Add status column to profiles for suspend/ban
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Add featured and category columns to article_generations
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.article_generations ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;
ALTER TABLE public.article_generations ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.article_generations ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';

-- Create prompt_templates table
CREATE TABLE public.prompt_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  prompt_instruction text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS on prompt_templates
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for prompt_templates
CREATE POLICY "Admins can manage prompt templates" ON public.prompt_templates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public read for active templates (for article generation)
CREATE POLICY "Anyone can read active templates" ON public.prompt_templates
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Admin can delete articles
CREATE POLICY "Admins can delete articles" ON public.article_generations
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin can update articles (for featured/status)
CREATE POLICY "Admins can update articles" ON public.article_generations
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin can delete profiles
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at on prompt_templates
CREATE TRIGGER update_prompt_templates_updated_at
  BEFORE UPDATE ON public.prompt_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
