import { ConfirmDeleteButton } from "@/components/confirm-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Badge } from "@/components/ui/badge";




import { useEnrollmentStore } from "@/lib/enrollment-store";

export function CourseTable() {
  const courses = useEnrollmentStore((s) => s.courses);
  const removeCourse = useEnrollmentStore((s) => s.removeCourse);

  return (
    <div className="rounded-lg border overflow-x-auto w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">รหัสวิชา</TableHead>
            <TableHead>ชื่อวิชา</TableHead>
            <TableHead className="w-16">หลักสูตร</TableHead>
            <TableHead className="w-32">ภาคการศึกษา</TableHead>
            <TableHead>รายละเอียด</TableHead>
            <TableHead>ผู้สอน</TableHead>
            <TableHead className="w-32">รับข่าวสารทางอีเมล</TableHead>
            <TableHead className="w-16">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-20 text-center text-muted-foreground"
              >
                ยังไม่มีวิชาที่เปิดสอน
              </TableCell>
            </TableRow>
          )}
          {courses.map((course) => (
            <TableRow key={course.courseId}>
              <TableCell>{course.courseId}</TableCell>
              <TableCell><div className="whitespace-normal wrap-break-word min-w-38">{course.courseTitle}</div></TableCell>
              <TableCell><Badge variant="outline">{course.program}</Badge></TableCell>
              <TableCell>{`ภาคการศึกษาที่ ${course.semester}`}</TableCell>
              <TableCell>
                <div className="whitespace-normal wrap-break-word min-w-24 text-muted-foreground">
                  {course.description ? course.description : "—"}
                </div>
              </TableCell>
              <TableCell>
                {course.instructors.length === 0 ? (
                  <span className="text-muted-foreground">ยังไม่มีผู้สอน</span>
                ) : (
                  course.instructors.map((i) => {
                    return (
                      <div key={i.email} className="flex flex-col gap-0">
                        <span className="block font-medium">{i.name}</span>
                        {i.email && (
                          <span className="block text-xs text-muted-foreground mb-1">
                            ({i.email})
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </TableCell>
              
              <TableCell>
                {course.notifyByEmail ? (
                  <Badge>รับ</Badge>
                ) : (
                  <Badge variant="outline">ไม่รับ</Badge>
                )}
              </TableCell>
              <TableCell>
                <ConfirmDeleteButton
                  label={`ลบวิชา ${course.courseId}`}
                  title="ลบวิชา?"
                  description={`ลบ ${course.courseId} — ${course.courseTitle} ออกจากรายวิชาที่เปิดสอน พร้อมการลงทะเบียนทั้งหมดของวิชานี้`}
                  onConfirm={() => removeCourse(course.courseId)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
