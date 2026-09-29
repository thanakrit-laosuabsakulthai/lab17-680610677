import { z } from "zod";

import type { Course } from "@/lib/types";

export const MAX_DESCRIPTION_LENGTH = 100;
export const MAX_INSTRUCTORS = 3;


export const courseFormSchema = z.object({
  courseId: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "รหัสวิชาต้องเป็นตัวเลข 6 หลัก"),
  courseTitle: z.string()
    .trim()
    .min(1, "กรอกชื่อวิชา"),
  program: z.enum(["CPE", "ISNE"], { message: "เลือกหลักสูตร" }),
  semester: z.enum(["1", "2", "3"], { message: "เลือกภาคการศึกษา" }),
  description: z
    .string()
    .trim()
    .max(MAX_DESCRIPTION_LENGTH, `รายละเอียดยาวได้ไม่เกิน ${MAX_DESCRIPTION_LENGTH} ตัวอักษร`),
  instructors: z
    .array(
      z.object({
        name: z.string().trim().min(1, "กรอกชื่อผู้สอน"),
        email: z.email("อีเมลไม่ถูกต้อง")
          .refine((email) => email.endsWith("@cmu.ac.th"), {
            message: "ต้องเป็นอีเมล @cmu.ac.th",
          }),
      }),
    )
    .min(1, "ต้องมีผู้สอนอย่างน้อย 1 คน")
    .max(MAX_INSTRUCTORS, `มีผู้สอนได้ไม่เกิน ${MAX_INSTRUCTORS} คน`)
    .refine(
      (items) =>
        new Set(items.map((i) => i.email.toLowerCase())).size === items.length,
      "อีเมลผู้สอนซ้ำกัน",
      ),
    notifyByEmail: z.boolean().optional(),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

/**
 * กันรหัสซ้ำด้วย .refine()
 * ต้องสร้าง "ข้างใน" component (ผ่าน useMemo) เพราะต้องรู้ course ล่าสุดจาก store
 */

export function createCourseFormSchema(existingCourses: Course[]) {
  return courseFormSchema.refine(
    (data) => !existingCourses.some((c) => c.courseId === data.courseId),
    { message: "รหัสวิชานี้มีอยู่แล้ว", path: ["courseId"] },
  );
}

/*

 สร้างฟอร์มเพิ่มวิชาเรียนด้วย React Hook Form + Zod (4 pts)
1.1. สร้าง Zod schema ที่ src/lib/schemas/course-schema.ts แทน course-validation.ts 
(ลบไฟล์เดิมออกได้) และใช้ z.infer สร้าง type CourseFormValues โดยไม่ประกาศ type ซ้ำเอง 
1.2. ใช้ useForm + zodResolver (mode: "onBlur") และ Controller ร่วมกับ Field / FieldLabel 
/ FieldError ของ shadcn/ui — ช่องที่ผิดต้องมีขอบสีแดง (aria-invalid) และข้อความ error ใต้ช่อง 
(2 pts)
1.3. ตรวจความถูกต้องของข้อมูลรหัสวิชาและชื่อวิชา (2 pts)
• รหัสวิชา — ตัวเลข 6 หลัก และห้ามซ้ำกับวิชาที่มีอยู่ ใช้ .refine() ใน 
createCourseFormSchema(courses) กำหนด error message เป็น “รหัสวิชานี้มีอยู่แล้ว”
• ชื่อวิชา — ห้ามมีค่าว่าง และมีความยาวไม่เกิน 100 ตัวอักษร
2. ข้อมูลผู้สอน (4 pts)
2.1. ใช้ช่องกรอกชื่อผู้สอนจากเป็นแบบ Array Fields ด้วย useFieldArray
• แต่ละแถวมี Input สำหรับป้อน ชื่อผู้สอน และ อีเมล (กำหนด placeholder เป็นข้อความว่า
name@cmu.ac.th) พร้อมเลขลำดับ 1., 2., 3.
• มีปุ่ม “เพิ่มผู้สอน” เรียก append({ name: "", email: "" }) — เป็นสถานะ disabled เมื่อครบ 
3 คน (1 pts)
• แสดงปุ่ม Icon X จาก lucide-react ท้ายแถว เรียก remove(index) — เป็นสถานะ disabled 
เมื่อเหลือ 1 คน (1 pts)
• ใช้ item.id ที่ useFieldArray สร้างให้เป็น key และเปิดฟอร์มมาต้องมีผู้สอน 1 แถวว่าง
2.2. ตรวจความถูกต้องของข้อมูลแยกแต่ละแถว (1 pts)
• ชื่อผู้สอน – ห้ามมีค่าว่าง, กำหนด placeholder เป็นข้อความ “กรอกชื่อผู้สอน”
• อีเมล – รูปแบบถูกต้อง และลงท้ายด้วย @cmu.ac.th, กำหนด placeholder เป็นข้อความ
“ต้องเป็นอีเมล @cmu.ac.th”
2.3. Array Validation (1 pts)
• มีผู้สอน 1–3 คน และแสดงจำนวนปัจจุบันใต้หัวข้อ เช่น “2/3 คน”
• อีเมลผู้สอนห้ามซ้ำกัน ( .refine() ), กำหนด error message เป็น “อีเมลผู้สอนซ้ำกัน” แสดง
ใต้รายการ ( errors.instructors.root )

*/