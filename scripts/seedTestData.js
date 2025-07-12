const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Test data fixtures
const profileFixtures = {
  validUser: {
    id: '550e8400-e29b-41d4-a716-446655440001',
    username: 'johndoe',
    full_name: 'John Doe',
    phone: '+905551234567',
    bio: 'Tech enthusiast and travel lover',
    preferences: { notifications: true, theme: 'light' },
    is_influencer: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  
  adminUser: {
    id: '550e8400-e29b-41d4-a716-446655440002',
    username: 'admin',
    full_name: 'Admin User',
    phone: '+905559876543',
    bio: 'Platform administrator',
    preferences: { notifications: true, theme: 'dark' },
    is_influencer: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  
  influencerUser: {
    id: '550e8400-e29b-41d4-a716-446655440003',
    username: 'influencer',
    full_name: 'Influencer User',
    phone: '+905551111111',
    bio: 'Social media influencer with 100k+ followers',
    preferences: { notifications: true, theme: 'light' },
    is_influencer: true,
    influencer_data: { followers: 150000, engagement_rate: 4.5 },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
};

const companyFixtures = {
  techCompany: {
    id: '550e8400-e29b-41d4-a716-446655440101',
    owner_id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'TechCorp',
    description: 'Leading technology company specializing in AI and machine learning solutions.',
    category: 'Technology',
    subcategories: ['AI', 'Machine Learning', 'Software'],
    address: 'Maslak, Istanbul, Turkey',
    phone: '+902121234567',
    email: 'info@techcorp.com',
    website: 'https://techcorp.com',
    logo_url: 'https://example.com/techcorp-logo.png',
    social_media: { instagram: '@techcorp', twitter: '@techcorp' },
    business_hours: { monday: '09:00-18:00', friday: '09:00-17:00' },
    verified: true,
    rating: 4.5,
    total_reviews: 25,
    subscription_tier: 'premium',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  
  financeCompany: {
    id: '550e8400-e29b-41d4-a716-446655440102',
    owner_id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'FinanceFlow',
    description: 'Digital banking and financial services provider.',
    category: 'Finance',
    subcategories: ['Banking', 'Digital Payments', 'Investment'],
    address: 'Çankaya, Ankara, Turkey',
    phone: '+903121234567',
    email: 'contact@financeflow.com',
    website: 'https://financeflow.com',
    logo_url: 'https://example.com/financeflow-logo.png',
    social_media: { linkedin: 'financeflow', instagram: '@financeflow' },
    business_hours: { monday: '08:00-17:00', friday: '08:00-16:00' },
    verified: true,
    rating: 4.2,
    total_reviews: 18,
    subscription_tier: 'basic',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
};

const programFixtures = {
  techProgram: {
    id: '550e8400-e29b-41d4-a716-446655440201',
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Istanbul Tech Tour',
    description: 'A day exploring the best tech companies and innovation hubs in Istanbul.',
    date: '2024-06-15',
    start_time: '09:00:00',
    end_time: '18:00:00',
    status: 'active',
    is_public: true,
    total_budget: 500.00,
    spent_amount: 150.00,
    metadata: { tags: ['tech', 'networking', 'innovation'] },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  
  financeProgram: {
    id: '550e8400-e29b-41d4-a716-446655440202',
    user_id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Financial District Exploration',
    description: 'Discover the financial heart of Ankara with visits to major banks and fintech companies.',
    date: '2024-07-20',
    start_time: '10:00:00',
    end_time: '16:00:00',
    status: 'draft',
    is_public: false,
    total_budget: 300.00,
    spent_amount: 0.00,
    metadata: { tags: ['finance', 'banking', 'business'] },
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
};

const campaignFixtures = {
  techCampaign: {
    id: '550e8400-e29b-41d4-a716-446655440301',
    company_id: '550e8400-e29b-41d4-a716-446655440101',
    title: 'Summer Tech Sale',
    description: 'Get up to 50% off on all tech products and services during summer sale.',
    campaign_type: 'discount',
    discount_type: 'percentage',
    discount_value: 50.00,
    start_date: '2024-06-01T00:00:00Z',
    end_date: '2024-08-31T23:59:59Z',
    target_audience: { age_range: '18-35', interests: ['technology', 'innovation'] },
    terms_conditions: 'Valid for new customers only. Cannot be combined with other offers.',
    usage_limit: 1000,
    used_count: 250,
    is_active: true,
    media_urls: ['https://example.com/tech-campaign-banner.jpg'],
    metadata: { priority: 'high', channels: ['social_media', 'email'] },
    created_at: '2024-05-15T00:00:00Z',
    updated_at: '2024-06-15T00:00:00Z',
  },
  
  financeCampaign: {
    id: '550e8400-e29b-41d4-a716-446655440302',
    company_id: '550e8400-e29b-41d4-a716-446655440102',
    title: 'New Customer Bonus',
    description: 'Open a new account and get 100 TL bonus credit.',
    campaign_type: 'special_offer',
    discount_type: 'fixed',
    discount_value: 100.00,
    start_date: '2024-07-01T00:00:00Z',
    end_date: '2024-12-31T23:59:59Z',
    target_audience: { customer_type: 'new', location: 'Turkey' },
    terms_conditions: 'Minimum deposit of 1000 TL required. Bonus credited within 5 business days.',
    usage_limit: 500,
    used_count: 75,
    is_active: true,
    media_urls: ['https://example.com/finance-campaign-banner.jpg'],
    metadata: { priority: 'medium', channels: ['email', 'mobile_app'] },
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2024-06-15T00:00:00Z',
  },
};

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase URL or Key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Note: For production use, you should use service role key to bypass RLS
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// const supabase = createClient(supabaseUrl, supabaseServiceKey, {
//   auth: { autoRefreshToken: false, persistSession: false }
// });

class TestDataSeeder {
  async seedProfiles() {
    try {
      console.log('🌱 Seeding profiles...');
      
      const profiles = Object.values(profileFixtures);
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profiles, { onConflict: 'id' });
      
      if (error) throw error;
      
      console.log(`✅ Successfully seeded ${profiles.length} profiles`);
      return { success: true, message: `Seeded ${profiles.length} profiles`, data };
    } catch (error) {
      console.error('❌ Error seeding profiles:', error.message);
      return { success: false, message: `Error seeding profiles: ${error.message}` };
    }
  }

  async seedCompanies() {
    try {
      console.log('🌱 Seeding companies...');
      
      const companies = Object.values(companyFixtures);
      const { data, error } = await supabase
        .from('companies')
        .upsert(companies, { onConflict: 'id' });
      
      if (error) throw error;
      
      console.log(`✅ Successfully seeded ${companies.length} companies`);
      return { success: true, message: `Seeded ${companies.length} companies`, data };
    } catch (error) {
      console.error('❌ Error seeding companies:', error.message);
      return { success: false, message: `Error seeding companies: ${error.message}` };
    }
  }

  async seedPrograms() {
    try {
      console.log('🌱 Seeding programs...');
      
      const programs = Object.values(programFixtures);
      const { data, error } = await supabase
        .from('programs')
        .upsert(programs, { onConflict: 'id' });
      
      if (error) throw error;
      
      console.log(`✅ Successfully seeded ${programs.length} programs`);
      return { success: true, message: `Seeded ${programs.length} programs`, data };
    } catch (error) {
      console.error('❌ Error seeding programs:', error.message);
      return { success: false, message: `Error seeding programs: ${error.message}` };
    }
  }

  async seedCampaigns() {
    try {
      console.log('🌱 Seeding campaigns...');
      
      const campaigns = Object.values(campaignFixtures);
      const { data, error } = await supabase
        .from('campaigns')
        .upsert(campaigns, { onConflict: 'id' });
      
      if (error) throw error;
      
      console.log(`✅ Successfully seeded ${campaigns.length} campaigns`);
      return { success: true, message: `Seeded ${campaigns.length} campaigns`, data };
    } catch (error) {
      console.error('❌ Error seeding campaigns:', error.message);
      return { success: false, message: `Error seeding campaigns: ${error.message}` };
    }
  }

  async seedAll() {
    console.log('🚀 Starting test data seeding process...');
    
    const results = [
      await this.seedProfiles(),
      await this.seedCompanies(),
      await this.seedPrograms(),
      await this.seedCampaigns(),
    ];
    
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    console.log(`\n📊 Seeding Summary:`);
    console.log(`✅ Successful: ${successCount}/${totalCount}`);
    console.log(`❌ Failed: ${totalCount - successCount}/${totalCount}`);
    
    if (successCount === totalCount) {
      console.log('🎉 All test data seeded successfully!');
    } else {
      console.log('⚠️  Some seeding operations failed. Check logs above.');
    }
  }

  async clearAll() {
    console.log('🧹 Clearing all test data...');
    
    try {
      // Clear in reverse order due to foreign key constraints
      await supabase.from('campaigns').delete().neq('id', '');
      await supabase.from('programs').delete().neq('id', '');
      await supabase.from('companies').delete().neq('id', '');
      await supabase.from('profiles').delete().neq('id', '');
      
      console.log('✅ All test data cleared successfully!');
    } catch (error) {
      console.error('❌ Error clearing test data:', error.message);
    }
  }
}

// CLI interface
const seeder = new TestDataSeeder();
const command = process.argv[2];

switch (command) {
  case 'seed':
    seeder.seedAll();
    break;
  case 'clear':
    seeder.clearAll();
    break;
  case 'profiles':
    seeder.seedProfiles();
    break;
  case 'companies':
    seeder.seedCompanies();
    break;
  case 'programs':
    seeder.seedPrograms();
    break;
  case 'campaigns':
    seeder.seedCampaigns();
    break;
  default:
    console.log(`\n📖 Usage: node scripts/seedTestData.js <command>\n\nCommands:\n  seed      - Seed all test data\n  clear     - Clear all test data\n  profiles  - Seed only profiles\n  companies - Seed only companies\n  programs  - Seed only programs\n  campaigns - Seed only campaigns\n`);
    break;
}