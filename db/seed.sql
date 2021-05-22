USE employee_db;

INSERT INTO department(name)
VALUES 
('User Experience'), ('Backend'), ('DevOps'), ('Quality Assurance');

INSERT INTO role (title, salary, department_id)
VALUES ("Lead UX", 98000, 1), ("Frontend Developer", 97000, 1),("UX Designer", 76000, 1), ("Lead Engineer", 100000, 2),("Backend Engineer", 90000, 2), ("Middle Stack Developer", 100000, 2), ("DevOps Lead", 160000, 3),("Cloud Architect", 150000, 3), ("QA Lead", 90000, 4),("QA Analyst", 80000, 4), ("Testers", 80000, 4);

INSERT INTO employee (first_name, last_name, role_id)
VALUES ("Maria", "Hemple", 1), ("Dorian", "Kempsey", 4), ("Harriet", "Schwarz", 7), ("George", "Almos", 9);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Albert", "Freeman", 2, 1), ("Dominique", "Harrow", 5, 2), ("Veronica", "Ashen", 6, 2), ("Leo", "Travers", 8, 3), ("Sarah", "Jay", 10, 4), ("Ryan", "Nelson", 11, 4);



