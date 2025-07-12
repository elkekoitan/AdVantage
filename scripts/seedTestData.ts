import { supabase } from '../src/services/supabase';
import { userFixtures, companyFixtures, programFixtures, campaignFixtures } from '../__tests__/fixtures/testData';

interface SeedResult {
  success: boolean;
  message: string;
  data?: any;
}

class TestDataSeeder {
  async seedUsers(): Promise<SeedResult> {
    try {
      console.log('🌱 Seeding users...');
      
      const users = Object.values(userFixtures);
      const { data, error } = await supabase
        .from('users')
        .upsert(users, { onConflict: 'id' });
      
      if (error) throw error;
      
      console.log(`✅ Successfully seeded ${users.length} users`);
      return { success: true, message: `Seeded ${users.length} users`, data };
    } catch (error) {
      console.error('❌ Error seeding users:', error);
      return { success: false, message: `Error seeding users: ${error}` };
    }
  }

  async seedCompanies(): Promise<SeedResult> {
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
      console.error('❌ Error seeding companies:', error);
      return { success: false, message: `Error seeding companies: ${error}` };
    }
  }

  async seedPrograms(): Promise<SeedResult> {
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
      console.error('❌ Error seeding programs:', error);
      return { success: false, message: `Error seeding programs: ${error}` };
    }
  }

  async seedCampaigns(): Promise<SeedResult> {
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
      console.error('❌ Error seeding campaigns:', error);
      return { success: false, message: `Error seeding campaigns: ${error}` };
    }
  }

  async seedAll(): Promise<void> {
    console.log('🚀 Starting test data seeding process...');
    
    const results = [
      await this.seedUsers(),
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

  async clearAll(): Promise<void> {
    console.log('🧹 Clearing all test data...');
    
    try {
      // Clear in reverse order due to foreign key constraints
      await supabase.from('campaigns').delete().neq('id', '');
      await supabase.from('programs').delete().neq('id', '');
      await supabase.from('companies').delete().neq('id', '');
      await supabase.from('users').delete().neq('id', '');
      
      console.log('✅ All test data cleared successfully!');
    } catch (error) {
      console.error('❌ Error clearing test data:', error);
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
  case 'users':
    seeder.seedUsers();
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
    console.log(`
📖 Usage: npx ts-node scripts/seedTestData.ts <command>

Commands:
  seed      - Seed all test data
  clear     - Clear all test data
  users     - Seed only users
  companies - Seed only companies
  programs  - Seed only programs
  campaigns - Seed only campaigns
`);
    break;
}

export { TestDataSeeder };