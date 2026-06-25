#!/usr/bin/env node

/**
 * Cleanup script to deactivate test templates
 * Usage: node scripts/cleanup-test-templates.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanup() {
  console.log('Starting cleanup of test templates...');
  
  const testSlugs = ['test-8', 'test-raw'];
  
  const result = await prisma.tripTemplate.updateMany({
    where: { slug: { in: testSlugs } },
    data: { status: 'INACTIVE' },
  });
  
  console.log('Deactivated ' + result.count + ' templates:', testSlugs.join(', '));
  
  // Verify counts
  const destinations = await prisma.travelDestination.count({ where: { status: 'ACTIVE' } });
  const templates = await prisma.tripTemplate.count({ where: { status: 'ACTIVE' } });
  const stayGuides = await prisma.stayGuide.count({ where: { status: 'ACTIVE' } });
  
  console.log('\nCurrent counts:');
  console.log('  Destinations: ' + destinations);
  console.log('  Templates: ' + templates);
  console.log('  StayGuides: ' + stayGuides);
  
  await prisma.$disconnect();
}

cleanup().catch(console.error);
