import { supabase } from '../lib/supabase'
import { CHAPTERS, BOOK_PROMPTS, BOOK_EXERCISES } from '../data/bookContent'

async function seedChapters() {
  console.log('Seeding chapters...')
  
  for (const chapter of CHAPTERS) {
    const { error } = await supabase
      .from('chapters')
      .upsert(chapter, { onConflict: 'number' })
    
    if (error) {
      console.error(`Error seeding chapter ${chapter.number}:`, error)
    } else {
      console.log(`✓ Chapter ${chapter.number}: ${chapter.title}`)
    }
  }
}

async function seedBookPrompts() {
  console.log('\nSeeding book prompts...')
  
  for (const prompt of BOOK_PROMPTS) {
    const { error } = await supabase
      .from('book_prompts')
      .upsert(prompt, { onConflict: 'id' })
    
    if (error) {
      console.error(`Error seeding prompt ${prompt.id}:`, error)
    } else {
      console.log(`✓ Prompt: ${prompt.title}`)
    }
  }
}

async function seedBookExercises() {
  console.log('\nSeeding book exercises...')
  
  for (const exercise of BOOK_EXERCISES) {
    const { error } = await supabase
      .from('book_exercises')
      .upsert(exercise, { onConflict: 'id' })
    
    if (error) {
      console.error(`Error seeding exercise ${exercise.id}:`, error)
    } else {
      console.log(`✓ Exercise: ${exercise.title}`)
    }
  }
}

async function seedBookContent() {
  try {
    console.log('🌱 Starting book content seeding...\n')
    
    await seedChapters()
    await seedBookPrompts()
    await seedBookExercises()
    
    console.log('\n✅ Book content seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding book content:', error)
    process.exit(1)
  }
}

// Run the seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedBookContent()
}

export { seedBookContent }