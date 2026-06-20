-- Matching Feature
CREATE TABLE IF NOT EXISTS public.creator_swipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    swiper_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    swipee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    is_right_swipe BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(swiper_id, swipee_id)
);

-- Music Feature
CREATE TABLE IF NOT EXISTS public.albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    cover_url TEXT,
    release_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.songs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    album_id UUID REFERENCES public.albums(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    cover_url TEXT,
    audio_url TEXT,
    duration TEXT,
    plays INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.creator_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Swipes policies
CREATE POLICY "Users can insert their own swipes" ON public.creator_swipes FOR INSERT WITH CHECK (auth.uid() = swiper_id);
CREATE POLICY "Users can view their own swipes" ON public.creator_swipes FOR SELECT USING (auth.uid() = swiper_id);

-- Albums and Songs policies (Publicly viewable)
CREATE POLICY "Albums are viewable by everyone" ON public.albums FOR SELECT USING (true);
CREATE POLICY "Songs are viewable by everyone" ON public.songs FOR SELECT USING (true);
