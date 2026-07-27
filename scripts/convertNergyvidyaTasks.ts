/**
 * Script to convert nergyvidya_tasks_db_v2.json into assignment.json format
 * Run: npx ts-node scripts/convertNergyvidyaTasks.ts
 */

import fs from 'fs'
import path from 'path'

// Load the nergyvidya database
const dbPath = path.join(process.cwd(), 'lib', 'nergyvidya_tasks_db_v2.json')
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))

// Course ID mapping from nergyvidya course IDs to our system
const COURSE_ID_MAP: Record<string, string> = {
  // GST Courses
  '299': 'trn-generation',
  '300': 'gst-registration-via-trn',
  '301': 'gstr-3b-filing',
  '302': 'nil-return-filing',
  '303': 'gst-composition-return-filing',
  '304': 'e-way-bill',
  
  // Income Tax Courses
  '305': 'epan-registration',
  '306': 'itr-registration',
  '307': 'itr1-old-regime',
  '308': 'itr1-new-regime',
  '309': 'tds',
  '310': 'tcs',
  
  // Labour Laws
  '311': 'epfo-registration',
  '312': 'esic-registration',
  
  // MCA Courses
  '529': 'mca-signup',
  '531': 'mca-din-allotment',
  '1408': 'dir3-kyc-web',
  '532': 'dir3-kyc',
  '530': 'name-reservation',
  '534': 'appointment-directors',
}

// Course names from the database
const COURSE_NAMES: Record<string, string> = {
  '299': 'GST - TRN Generation',
  '300': 'GST - Registration (via TRN)',
  '301': 'GST - Returns (GSTR-1 & 3B)',
  '302': 'GST - Nil Returns',
  '303': 'GST - CMP-08 Composition',
  '304': 'GST - E-Way Bill',
  '305': 'E-PAN Application',
  '306': 'Income Tax - IT Portal Registration',
  '307': 'Income Tax - ITR-1 Filing (Salaried)',
  '308': 'Income Tax - ITR-1 (Complex/NR)',
  '309': 'Income Tax - TDS Compliance',
  '310': 'Income Tax - TCS Compliance',
  '311': 'Labour Laws - EPFO Registration',
  '312': 'Labour Laws - ESIC Registration',
  '529': 'MCA - User Signup',
  '531': 'MCA - DIN Allotment',
  '1408': 'MCA - DIR-3 KYC (Web)',
  '532': 'MCA - DIR-3 KYC',
  '530': 'MCA - SPICe+ Name Reservation',
  '534': 'MCA - DIR-12 Appointment',
}

// Category mapping
const COURSE_CATEGORY: Record<string, string> = {
  '299': 'Goods and Services Tax',
  '300': 'Goods and Services Tax',
  '301': 'Goods and Services Tax',
  '302': 'Goods and Services Tax',
  '303': 'Goods and Services Tax',
  '304': 'Goods and Services Tax',
  '305': 'Income Tax',
  '306': 'Income Tax',
  '307': 'Income Tax',
  '308': 'Income Tax',
  '309': 'Income Tax',
  '310': 'Income Tax',
  '311': 'Labour Laws',
  '312': 'Labour Laws',
  '529': 'Ministry of Corporate Affairs',
  '531': 'Ministry of Corporate Affairs',
  '1408': 'Ministry of Corporate Affairs',
  '532': 'Ministry of Corporate Affairs',
  '530': 'Ministry of Corporate Affairs',
  '534': 'Ministry of Corporate Affairs',
}

interface AssignmentTask {
  task_id: string
  category: string
  course: string
  duration_minutes: number
  scenario: string
  business_name?: string
  location?: string
  period?: string
  credentials?: Record<string, string>
  portal_name?: string
  portal_url?: string
  applicant_details?: Record<string, unknown>
  seq_no: number
  [key: string]: unknown
}

const assignmentTasks: AssignmentTask[] = []
let globalSeq = 1

// Process each course
Object.entries(db.by_course).forEach(([courseId, taskIds]) => {
  const mappedCourseId = COURSE_ID_MAP[courseId]
  if (!mappedCourseId) {
    console.warn(`⚠️  Skipping unmapped course ID: ${courseId}`)
    return
  }

  const courseName = COURSE_NAMES[courseId] || db.tasks[taskIds[0] as string]?.course_name || 'Unknown Course'
  const category = COURSE_CATEGORY[courseId] || 'Other'

  console.log(`✓ Processing ${courseName} (${taskIds.length} tasks)`)

  ;(taskIds as string[]).forEach((taskId, idx) => {
    const task = db.tasks[taskId]
    if (!task || !task.scenario) {
      console.warn(`  ⚠️  Skipping task ${taskId} (missing scenario)`)
      return
    }

    const assignmentTask: AssignmentTask = {
      task_id: task.task_id,
      category,
      course: courseName,
      duration_minutes: task.duration || 20,
      scenario: task.scenario,
      seq_no: globalSeq++,
      
      // Portal info
      portal_name: task.portal_name,
      portal_url: task.portal_url,
      
      // Credentials
      credentials: task.credentials || {},
    }

    // Parse scenario to extract business/location/period
    // Try to extract business name from scenario
    const lines = task.scenario.split('\n').filter((l: string) => l.trim())
    
    // For GST courses, try to extract business name from scenario
    if (category === 'Goods and Services Tax') {
      // Look for patterns like "Abdul Aziz & Sons" or "Mahadev Enterprises"
      const nameMatch = task.scenario.match(/([A-Z][a-z]+ (?:[A-Z][a-z]+\s)*(?:Enterprises|Associates|& Sons|Trading Co\.|Pvt\. Ltd\.|Ltd\.))/i)
      if (nameMatch) {
        assignmentTask.business_name = nameMatch[1]
      }
      
      // Look for location patterns
      const locationMatch = task.scenario.match(/in ([A-Z][a-z]+(?:\s[A-Z][a-z]+)?),\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i)
      if (locationMatch) {
        assignmentTask.location = `${locationMatch[1]}, ${locationMatch[2]}`
      }
      
      // Look for period patterns (e.g., "December 2025", "quarter ending June 2025")
      const periodMatch = task.scenario.match(/((?:quarter ending\s+)?(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/i)
      if (periodMatch) {
        assignmentTask.period = periodMatch[1]
      }
    }
    
    // For Income Tax courses
    if (category === 'Income Tax') {
      // Extract applicant name
      const nameMatch = task.scenario.match(/(?:Mr\.|Ms\.|Mrs\.)\s+([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i)
      if (nameMatch) {
        assignmentTask.business_name = nameMatch[1]
      }
      
      // Extract location from address
      const locationMatch = task.scenario.match(/State:\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i)
      if (locationMatch) {
        assignmentTask.location = locationMatch[1]
      }
    }
    
    // For MCA courses
    if (category === 'Ministry of Corporate Affairs') {
      // Extract company name or applicant name
      const companyMatch = task.scenario.match(/([A-Z][a-z]+\s+[A-Z][a-z]+\s+(?:Ltd\.|Pvt\. Ltd\.))/i)
      const personMatch = task.scenario.match(/(?:Mr\.|Ms\.)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i)
      assignmentTask.business_name = companyMatch ? companyMatch[1] : (personMatch ? personMatch[1] : undefined)
    }

    // Add all extra data fields from the task
    if (task.data && Object.keys(task.data).length > 0) {
      Object.assign(assignmentTask, task.data)
    }

    assignmentTasks.push(assignmentTask)
  })
})

// Write to assignment.json
const outputPath = path.join(process.cwd(), 'public', 'assignment.json')
fs.writeFileSync(outputPath, JSON.stringify(assignmentTasks, null, 1))

console.log(`\n✅ Converted ${assignmentTasks.length} tasks from ${Object.keys(db.by_course).length} courses`)
console.log(`📄 Output: ${outputPath}`)
console.log(`\n📊 Tasks by category:`)
const byCat = assignmentTasks.reduce((acc, t) => {
  acc[t.category] = (acc[t.category] || 0) + 1
  return acc
}, {} as Record<string, number>)
Object.entries(byCat).forEach(([cat, count]) => {
  console.log(`   ${cat}: ${count} tasks`)
})
