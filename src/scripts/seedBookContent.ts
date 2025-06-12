import { supabase } from '../lib/supabase'
import { CHAPTERS, BOOK_PROMPTS, BOOK_EXERCISES } from '../data/bookContent'

async function seedChapters() {
  console.log('🔄 Seeding chapters...')
  
  for (const chapter of CHAPTERS) {
    const { error } = await supabase
      .from('chapters')
      .upsert(chapter, { onConflict: 'number' })
    
    if (error) {
      console.error(`❌ Error seeding chapter ${chapter.number}:`, error.message)
      throw error
    } else {
      console.log(`✅ Chapter ${chapter.number}: ${chapter.title}`)
    }
  }
  
  console.log(`✅ Successfully seeded ${CHAPTERS.length} chapters`)
}

async function seedBookPrompts() {
  console.log('\n🔄 Seeding book prompts...')
  
  for (const prompt of BOOK_PROMPTS) {
    const { error } = await supabase
      .from('book_prompts')
      .upsert(prompt, { onConflict: 'id' })
    
    if (error) {
      console.error(`❌ Error seeding prompt ${prompt.id}:`, error.message)
      throw error
    } else {
      console.log(`✅ Prompt: ${prompt.title}`)
    }
  }
  
  console.log(`✅ Successfully seeded ${BOOK_PROMPTS.length} prompts`)
}

async function seedBookExercises() {
  console.log('\n🔄 Seeding book exercises...')
  
  for (const exercise of BOOK_EXERCISES) {
    // Make sure fields is stored as a JSON object, not a string
    const exerciseData = {
      ...exercise,
      fields: typeof exercise.fields === 'string' 
        ? JSON.parse(exercise.fields) 
        : exercise.fields
    }
    
    const { error } = await supabase
      .from('book_exercises')
      .upsert(exerciseData, { onConflict: 'id' })
    
    if (error) {
      console.error(`❌ Error seeding exercise ${exercise.id}:`, error.message)
      throw error
    } else {
      console.log(`✅ Exercise: ${exercise.title}`)
    }
  }
  
  console.log(`✅ Successfully seeded ${BOOK_EXERCISES.length} exercises`)
}

export async function seedBookContent() {
  try {
    console.log('🌱 Starting book content seeding...\n')
    
    // Test database connection first
    const { data, error } = await supabase.from('chapters').select('count').limit(1)
    if (error) {
      throw new Error(`Database connection failed: ${error.message}`)
    }
    
    await seedChapters()
    await seedBookPrompts()
    await seedBookExercises()
    
    console.log('\n🎉 Book content seeding completed successfully!')
    console.log('📚 You can now view the exercises in the Exercises page!')
    
  } catch (error: any) {
    console.error('\n❌ Error seeding book content:', error.message)
    throw error
  }
}

// Run the seeding if this file is executed directly
if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  seedBookContent().catch(console.error)
}