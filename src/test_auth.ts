import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fafpyshhhdqgvhhfycfc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhZnB5c2hoaGRxZ3ZoaGZ5Y2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NjQwNDQsImV4cCI6MjA5NzA0MDA0NH0.PnSiKjfyU8Dx5dqIIga5f6dF3TbBUqJ6XKlpiKV90l8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  const email = `testuser_${Date.now()}@example.com`;
  
  console.log("Testing SignUp with", email);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: email,
    password: 'password123',
  });
  console.log("SignUp Error:", signUpError?.message || 'Success');

  if (signUpError) {
      console.log("Full SignUp Error object:", JSON.stringify(signUpError, null, 2));
  }

  console.log("\nTesting SignIn with same email...");
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: email,
    password: 'password123',
  });
  console.log("SignIn Error:", signInError?.message || 'Success');
}

testAuth();
