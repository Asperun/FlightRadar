using System;
using System.Linq;
using FlightRadar.Models;

namespace FlightRadar.Data
{
    public static class DbInitializer
    {
        public static void InitPlanes(PlaneContext context)
        {
            context.Database.EnsureCreated();

            // Look for any students.
            if (context.Planes.Any())
            {
                Console.WriteLine("Planes already initialized");
                return;
            }

            var plane = new Plane { Icao24 = "chuj" };
            context.Planes.Add(plane);
            context.SaveChanges();
        }

    //     public static void Initialize(SchoolContext context)
    //     {
    //         context.Database.EnsureCreated();
    //
    //         // Look for any students.
    //         if (context.Students.Any()) return; // DB has been seeded
    //
    //         var students = new[]
    //         {
    //             new()
    //             {
    //                 FirstMidName = "Carson", LastName = "Alexander", EnrollmentDate = DateTime.Parse("2005-09-01")
    //             },
    //             new Student
    //             {
    //                 FirstMidName = "Meredith", LastName = "Alonso", EnrollmentDate = DateTime.Parse("2002-09-01")
    //             },
    //             new Student
    //             {
    //                 FirstMidName = "Arturo", LastName = "Anand", EnrollmentDate = DateTime.Parse("2003-09-01")
    //             },
    //             new Student
    //             {
    //                 FirstMidName = "Gytis", LastName = "Barzdukas", EnrollmentDate = DateTime.Parse("2002-09-01")
    //             },
    //             new Student { FirstMidName = "Yan", LastName = "Li", EnrollmentDate = DateTime.Parse("2002-09-01") },
    //             new Student
    //             {
    //                 FirstMidName = "Peggy", LastName = "Justice", EnrollmentDate = DateTime.Parse("2001-09-01")
    //             },
    //             new Student
    //             {
    //                 FirstMidName = "Laura", LastName = "Norman", EnrollmentDate = DateTime.Parse("2003-09-01")
    //             },
    //             new Student
    //             {
    //                 FirstMidName = "Nino", LastName = "Olivetto", EnrollmentDate = DateTime.Parse("2005-09-01")
    //             }
    //         };
    //         foreach (Student s in students)
    //         {
    //             context.Students.Add(s);
    //         }
    //
    //         context.SaveChanges();
    //
    //         var courses = new[]
    //         {
    //             new() { Title = "Chemistry", Credits = 3 },
    //             new Course { Title = "Microeconomics", Credits = 3 },
    //             new Course { Title = "Macroeconomics", Credits = 3 },
    //             new Course { Title = "Calculus", Credits = 4 },
    //             new Course { Title = "Trigonometry", Credits = 4 },
    //             new Course { Title = "Composition", Credits = 3 },
    //             new Course { Title = "Literature", Credits = 4 }
    //         };
    //         foreach (Course c in courses)
    //         {
    //             context.Courses.Add(c);
    //         }
    //
    //         context.SaveChanges();
    //
    //         var enrollments = new[]
    //         {
    //             new() { StudentID = 1, CourseID = 1, Grade = Grade.A },
    //             new Enrollment { StudentID = 1, CourseID = 2, Grade = Grade.C },
    //             new Enrollment { StudentID = 1, CourseID = 3, Grade = Grade.B },
    //             new Enrollment { StudentID = 2, CourseID = 4, Grade = Grade.B },
    //             new Enrollment { StudentID = 2, CourseID = 5, Grade = Grade.F },
    //             new Enrollment { StudentID = 2, CourseID = 3, Grade = Grade.F },
    //             new Enrollment { StudentID = 3, CourseID = 2 },
    //             new Enrollment { StudentID = 4, CourseID = 1 },
    //             new Enrollment { StudentID = 4, CourseID = 5, Grade = Grade.F },
    //             new Enrollment { StudentID = 5, CourseID = 2, Grade = Grade.C },
    //             new Enrollment { StudentID = 6, CourseID = 2 },
    //             new Enrollment { StudentID = 7, CourseID = 1, Grade = Grade.A }
    //         };
    //         foreach (Enrollment e in enrollments)
    //         {
    //             context.Enrollments.Add(e);
    //         }
    //
    //         context.SaveChanges();
    //     }
    }
}