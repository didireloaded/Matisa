-- Step 4: Lock Scope - Remove Marketplace/Creator/Wallet Features
-- These features (creator profiles, crew profiles, opportunities, and wallet/gifting)
-- were explicitly cut from this app's scope and have been removed to stabilize the repository.

DROP TABLE IF EXISTS public.creator_profiles CASCADE;
DROP TABLE IF EXISTS public.crew_profiles CASCADE;
DROP TABLE IF EXISTS public.opportunities CASCADE;
DROP TABLE IF EXISTS public.wallets CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.gifts CASCADE;
