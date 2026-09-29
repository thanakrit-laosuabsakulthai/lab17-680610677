import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, RotateCcw, X, Plus } from "lucide-react";
import {
  Controller,
  useFieldArray,
  useForm,
  type DefaultValues,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,

} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEnrollmentStore } from "@/lib/enrollment-store";

// radio group, textarea, switch
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import { createCourseFormSchema, type CourseFormValues, MAX_INSTRUCTORS, MAX_DESCRIPTION_LENGTH } from "@/lib/schemas/course-schema";

const programOptions = [
  { value: "CPE", label: "CPE — วิศวกรรมคอมพิวเตอร์" },
  { value: "ISNE", label: "ISNE — วิศวกรรมระบบสารสนเทศและเครือข่าย" },
];

const semesterOptions = [
  { value: "1", label: "ภาคการศึกษาที่ 1" },
  { value: "2", label: "ภาคการศึกษาที่ 2" },
  { value: "3", label: "ภาคฤดูร้อน" },
];
  

/**
 *   (Lab 17): เขียนฟอร์มนี้ใหม่ด้วย Zod + React Hook Form
 *   (ดูตัวอย่างใน components/students/add-new-student-dialog.tsx)
 *   - schema ใหม่ที่ src/lib/schemas/course-schema.ts (แทน course-validation.ts)
 *   - ผู้สอนเป็น Array Fields (useFieldArray) — ชื่อ + อีเมล @cmu.ac.th, 1–3 คน
 *   - หลักสูตร (Select), ภาคการศึกษา (Radio Group), รายละเอียด (Textarea 0/100),
 *     รับข่าวสารทางอีเมล (Switch)
 */

const emptyCourseForm: DefaultValues<CourseFormValues> = {
  courseId: "",
  courseTitle: "",
  program: undefined,
  semester: undefined,
  description: "",
  instructors: [{ name: "", email: "" }],
  notifyByEmail: false,
};

export function AddNewCourseDialog() {
  const addCourse = useEnrollmentStore((s) => s.addCourse);
  const courses = useEnrollmentStore((s) => s.courses);
  const [open, setOpen] = useState(false);

  // schema ต้องสร้างใหม่เมื่อ students เปลี่ยน เพื่อให้ .refine() กันรหัสซ้ำเห็นข้อมูลล่าสุด
  const schema = useMemo(() => createCourseFormSchema(courses), [courses]);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyCourseForm,
    mode: "onBlur", 
  });

  // ─── useFieldArray ───
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "instructors",
  });

  const emailsError =
    form.formState.errors.instructors?.root ?? form.formState.errors.instructors;
  
  
  
  const resetForm = () => form.reset(emptyCourseForm);

  // ถึงจุดนี้แปลว่า Zod validate ผ่านแล้วทุก field (ค่าถูก trim แล้วด้วย)
  function onSubmit(values: CourseFormValues) {
    addCourse(values);
    resetForm();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlusCircle className="h-4 w-4" />
        เพิ่มวิชา
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form 
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="grid gap-4"
        >
          <DialogHeader>
            <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
            <DialogDescription>
              กรอกรหัสวิชา ชื่อวิชา และผู้สอน
            </DialogDescription>
          </DialogHeader>
          
          <FieldGroup className="gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm-items-end">
              <div className="flex-1">
                <Controller
                  name="courseId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLegend variant="label">รหัสวิชา</FieldLegend>
                      <Input
                        {...field}
                        id="courseId"
                        placeholder="เช่น 261305"
                        inputMode="numeric"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              <div className="flex-3">
                <Controller
                  name="courseTitle"
                  control={form.control}
                  render={({ field, fieldState }) => (  
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLegend variant="label">ชื่อวิชา</FieldLegend>
                      <Input
                        {...field}
                        id="courseTitle"
                        aria-invalid={fieldState.invalid}
                        placeholder="เช่น Mobile Application Development"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </div>
            
            <Controller
              name="program"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLegend variant="label">หลักสูตร</FieldLegend>
                  <Select
                    name={field.name}
                    items={programOptions}
                    value={field.value ?? null}
                    onValueChange={(v) => {
                      field.onChange(v);
                      field.onBlur(); 
                    }}
                  >
                    <SelectTrigger
                      id="program"
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                      ref={field.ref}
                    >
                      <SelectValue placeholder="เลือกหลักสูตร" />
                    </SelectTrigger>
                    <SelectContent>
                      {programOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            
            <Controller
              name="semester"
              control={form.control}
              render={({ field, fieldState }) => (
                <FieldSet data-invalid={fieldState.invalid}>
                  <FieldLegend variant="label">ภาคการศึกษา</FieldLegend>
                  <RadioGroup
                    name={field.name}
                    value={field.value ?? null}
                    onValueChange={(v) => {
                      field.onChange(v);
                      field.onBlur(); 
                    }}
                    className="flex flex-row gap-4 w-max"
                  >
                    {semesterOptions.map((o) => (
                      <Field key={o.value} orientation="horizontal" data-invalid={fieldState.invalid}>
                        <RadioGroupItem
                          id={`semester-${o.value}`}
                          value={o.value}
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldLabel
                          htmlFor={`semester-${o.value}`}
                          className="whitespace-nowrap"
                        >
                          {o.label}
                        </FieldLabel>
                      </Field>
                    ))}
                  </RadioGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldSet>
              )}
            />
            
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLegend variant="label">รายละเอียด</FieldLegend>
                  <FieldDescription>
                    รายละเอียดวิชา (ไม่เกิน {MAX_DESCRIPTION_LENGTH} ตัวอักษร)
                  </FieldDescription>
                  <Textarea
                    {...field}
                    id="description"
                    aria-invalid={fieldState.invalid}
                    placeholder="คำอธิบายรายวิชาสั้นๆ"
                  />
                  <span 
                    className={`text-sm text-muted-foreground ${fieldState.invalid ? "text-destructive" : ""}`}
                  >
                    {field.value.length}/{MAX_DESCRIPTION_LENGTH} 
                  </span>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            
            <FieldSet data-invalid={!!emailsError?.message}>
              <FieldLegend variant="label">ผู้สอน</FieldLegend>
              <FieldDescription>
                {fields.length}/{MAX_INSTRUCTORS} — กรอกชื่อผู้สอน และอีเมล name@cmu.ac.th (ห้ามซ้ำกัน)
              </FieldDescription>
              <FieldGroup className="gap-3">
                {fields.map((item, index) => (
                  <div key={item.id} className="flex items-start gap-2">
                    <span className="mt-1.5 w-5 shrink-0 text-sm text-muted-foreground">
                      {index + 1}.
                    </span>
                    <Controller
                      name={`instructors.${index}.name`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="flex-1">
                          <FieldContent>
                            <Input
                              {...field}
                              id={`instructor-name-${index}`}
                              placeholder="กรอกชื่อผู้สอน"
                              aria-label={`ชื่อผู้สอนที่ ${index + 1}`}
                              aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </FieldContent>
                        </Field>
                      )}
                    />
                    <Controller
                      name={`instructors.${index}.email`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="flex-1">
                          <FieldContent>
                            <Input
                              {...field}
                              id={`instructor-email-${index}`}
                              type="email"
                              placeholder="name@cmu.ac.th"
                              aria-label={`อีเมลผู้สอนที่ ${index + 1}`}
                              aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </FieldContent>
                        </Field>
                      )}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 1} 
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ name: "", email: "" })}
                  disabled={fields.length >= MAX_INSTRUCTORS}
                  className="w-max"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  เพิ่มผู้สอน
                </Button>
                {emailsError?.message && (
                  <FieldError errors={[emailsError]} />
                )}
              </FieldGroup>
            </FieldSet>
            
            <Controller
              name="notifyByEmail"
              control={form.control}
              render={({ field }) => (
                <FieldGroup className="w-full rounded-lg border p-3">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>รับข่าวสารทางอีเมล</FieldTitle>
                      <FieldDescription>แจ้งเตือนผู้สอนเมื่อเปิดลงทะเบียน</FieldDescription>
                    </FieldContent>
                    <Switch
                      id="notifyByEmail"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </Field>
                </FieldGroup>
              )}
            />
            
            
          </FieldGroup>
          
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetForm}>
              <RotateCcw className="h-4 w-4" />
              ล้างฟอร์ม
            </Button>
            <Button type="submit">บันทึก</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


/*

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        // ปิด popup แล้วล้างค่า/error — เปิดใหม่ต้องได้ฟอร์มว่าง
        if (!next) resetForm();
      }}
    >
      <DialogTrigger render={<Button />}>
        <UserPlus className="h-4 w-4" />
        เพิ่มนักศึกษา
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="grid gap-4"
        >
          <DialogHeader>
            <DialogTitle>เพิ่มนักศึกษาใหม่</DialogTitle>
            <DialogDescription>
              ลองเว้นช่องว่าง ใส่รหัสนักศึกษาไม่ครบ 9 หลัก ใส่รหัสที่มีอยู่แล้ว
              หรือไม่เลือกความสนใจเลย แล้วกดบันทึก
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-4">
            <Controller
              name="studentId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="studentId">รหัสนักศึกษา</FieldLabel>
                  <Input
                    {...field}
                    id="studentId"
                    placeholder="650610099"
                    inputMode="numeric"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="firstName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="firstName">ชื่อ</FieldLabel>
                    <Input
                      {...field}
                      id="firstName"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="lastName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="lastName">นามสกุล</FieldLabel>
                    <Input
                      {...field}
                      id="lastName"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="program"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="program">หลักสูตร</FieldLabel>
                  <Select
                    name={field.name}
                    items={programOptions}
                    value={field.value ?? null}
                    onValueChange={(v) => {
                      field.onChange(v);
                      field.onBlur(); 
                    }}
                  >
                    <SelectTrigger
                      id="program"
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                      ref={field.ref}
                    >
                      <SelectValue placeholder="เลือกหลักสูตร" />
                    </SelectTrigger>
                    <SelectContent>
                      {programOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="interests"
              control={form.control}
              render={({ field, fieldState }) => (
                <FieldSet data-invalid={fieldState.invalid}>
                  <FieldLegend variant="label">
                    ความสนใจ (Checkbox หลายตัว)
                  </FieldLegend>
                  <FieldDescription>เลือก 1–3 ด้าน</FieldDescription>
                  <FieldGroup data-slot="checkbox-group" className="gap-3">
                    {interestOptions.map((item) => (
                      <Field
                        key={item.id}
                        orientation="horizontal"
                        data-invalid={fieldState.invalid}
                      >
                        <Checkbox
                          id={`interest-${item.id}`}
                          name={field.name}
                          aria-invalid={fieldState.invalid}
                          checked={field.value.includes(item.id)}
                          onCheckedChange={(checked) => {
                            field.onChange(
                              checked
                                ? [...field.value, item.id]
                                : field.value.filter((id) => id !== item.id)
                            );
                            field.onBlur();
                          }}
                        />
                        <FieldLabel
                          htmlFor={`interest-${item.id}`}
                          className="font-normal"
                        >
                          {item.label}
                        </FieldLabel>
                      </Field>
                    ))}
                  </FieldGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldSet>
              )}
            />

            <FieldSet data-invalid={!!emailsError?.message}>
              <FieldLegend variant="label">อีเมล</FieldLegend>
              <FieldDescription>
                {fields.length}/{MAX_EMAILS} อีเมล — ห้ามซ้ำกัน
              </FieldDescription>

              <FieldGroup className="gap-3">
                {fields.map((item, index) => (
                  <div key={item.id} className="flex items-start gap-2">
                    <span className="mt-1.5 w-5 shrink-0 text-sm text-muted-foreground">
                      {index + 1}.
                    </span>
                    <Controller
                      name={`emails.${index}.address`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="flex-1">
                          <FieldContent>
                            <Input
                              {...field}
                              id={`email-${index}`}
                              type="email"
                              placeholder="name@cmu.ac.th"
                              aria-label={`อีเมลที่ ${index + 1}`}
                              aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </FieldContent>
                        </Field>
                      )}
                    />
                    {─── remove(index) ─── }
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`ลบอีเมลที่ ${index + 1}`}
                      disabled={fields.length <= 1}
                      onClick={() => remove(index)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </FieldGroup>

              {/* ─── Array Validation: error ระดับ array ─── }
              {emailsError?.message && <FieldError errors={[emailsError]} />}

              {/* ─── append({...}) ─── }
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                disabled={fields.length >= MAX_EMAILS}
                onClick={() => append({ address: "" })}
              >
                <Plus className="size-4" />
                เพิ่มอีเมล
              </Button>
            </FieldSet>
          </FieldGroup>

          <DialogFooter>
            {/* ล้างฟอร์ม — กลับเป็นค่าเริ่มต้น + ล้าง error โดยไม่ปิด popup }
            <Button type="button" variant="outline" onClick={resetForm}>
              <RotateCcw className="h-4 w-4" />
              ล้างฟอร์ม
            </Button>
            <Button type="submit">บันทึก</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}




*/