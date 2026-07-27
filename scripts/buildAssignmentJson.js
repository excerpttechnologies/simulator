/**
 * Converts nergyvidya_tasks_db_v2.json → public/assignment.json
 * Run: node scripts/buildAssignmentJson.js
 */
const fs = require('fs')
const path = require('path')

const dbPath = path.join(process.cwd(), 'lib', 'nergyvidya_tasks_db_v2.json')
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))

// Maps nergyvidya course IDs → our display course names
const COURSE_NAMES = {
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

const COURSE_CATEGORY = {
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

const tasks = []
let seq = 1

Object.entries(db.by_course).forEach(([courseId, taskIds]) => {
  const courseName = COURSE_NAMES[courseId]
  if (!courseName) {
    console.warn(`⚠ Skipping unmapped course: ${courseId}`)
    return
  }

  const category = COURSE_CATEGORY[courseId] || 'Other'
  let courseSeq = 0

  taskIds.forEach((taskId) => {
    const t = db.tasks[taskId]
    if (!t || !t.scenario) return  // skip tasks without scenario

    courseSeq++

    const task = {
      task_id: t.task_id,
      category,
      course: courseName,
      duration_minutes: t.duration || 20,
      scenario: t.scenario.trim(),
      seq_no: seq++,
      portal_name: t.portal_name || null,
      portal_url: t.portal_url || null,
      credentials: t.credentials || {},
    }

    // Extract useful fields from scenario text
    const scenario = t.scenario

    // Business name detection — must be a short, specific name
    const bizPatterns = [
      // Quoted: named "Foo Bar"
      /\bnamed?\s+"([^"]{2,50})"/i,
      // Brand name: "brand name "FOO"
      /brand name\s+"?([A-Z][A-Za-z0-9 &'.]{1,40})"?/i,
      // Establishment Name: Foo Bar
      /Establishment Name:\s*([^\n]{2,50})/i,
      // Name of the office: Foo Bar
      /Name of the (?:office|firm):\s*([^\n]{2,50})/i,
      // named/named as Foo Bar (stop before period/comma)
      /\bnamed?\s+([A-Z][A-Za-z0-9 &'.]{1,40}?)(?:\s*[,\.]|\s+He|\s+She|\s+to|\s+and|\s+is|\s+for|\s+in\b)/,
    ]
    for (const pat of bizPatterns) {
      const m = scenario.match(pat)
      if (m && m[1].trim().length <= 60) {
        task.business_name = m[1].trim()
        break
      }
    }

    // Applicant/proprietor name — "Name of the Proprietor: X Y" or "Mr./Ms. X Y"
    const propMatch = scenario.match(/Name of the Proprietor[\t\s:]+([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i)
    const mrMatch = scenario.match(/(?:^|\n)\s*(?:Mr\.|Ms\.|Mrs\.|Dr\.)\s+([A-Z][a-z]+(?: [A-Z][a-z]+){1,3})\b/m)
    if (propMatch) task.applicant_name = propMatch[1].trim()
    else if (mrMatch) task.applicant_name = mrMatch[1].trim()

    // Location — District + State
    const stateMatch = scenario.match(/State:\s*([^\n\t,]{2,40})/i)
    const districtMatch = scenario.match(/District:\s*([^\n\t,]{2,40})/i)
    if (districtMatch && stateMatch) {
      task.location = `${districtMatch[1].trim()}, ${stateMatch[1].trim()}`
    } else if (stateMatch) {
      task.location = stateMatch[1].trim()
    }

    // Period for return-filing tasks
    const periodMatch = scenario.match(/((?:quarter ending\s+)?(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/i)
    if (periodMatch) task.period = periodMatch[1]

    tasks.push(task)
  })
})

const outputPath = path.join(process.cwd(), 'public', 'assignment.json')
fs.writeFileSync(outputPath, JSON.stringify(tasks, null, 1))

console.log(`✅ Generated ${tasks.length} tasks from ${Object.keys(db.by_course).length} courses`)
const byCat = tasks.reduce((a, t) => { a[t.category] = (a[t.category]||0)+1; return a }, {})
Object.entries(byCat).forEach(([cat, n]) => console.log(`   ${cat}: ${n}`))
console.log(`📄 Written to: ${outputPath}`)
