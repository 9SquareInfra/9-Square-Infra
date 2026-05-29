/* 
   ==========================================================================
   9 SQUARE INFRA - CORE OPERATIONS INTERACTIVE SYSTEMS
   ==========================================================================
   Description: LocalStorage database operations, live syncing between 
                Manager uploads and Admin feeds, Trello-Kanban tasks flow,
                Material approvals, Expense charting, and Estimations engine.
   ==========================================================================
*/

document.addEventListener('DOMContentLoaded', () => {

    // --- STATE & INITIAL SEED DATA ---
    let state = {
        projects: [],
        updates: [],
        tasks: [],
        materials: [],
        expenses: [],
        staff: [],
        whatsapp_logs: []
    };

    // Standard seed details to pre-populate database if empty
    const seedData = {
        projects: [
            { id: "proj-1", name: "Villa A - Golden Hills", client: "Ananya Birla", manager: "Ramesh", progress: 65, status: "Running" },
            { id: "proj-2", name: "Flat B - Sea Breeze", client: "Devendra Fadnavis", manager: "Suresh", progress: 40, status: "Delayed" },
            { id: "proj-3", name: "Loft C - Tech Park", client: "Rohan Builders", manager: "Amit", progress: 85, status: "Running" }
        ],
        updates: [
            { id: "upd-1", project_id: "proj-1", work_done: "False ceiling completed in master living suite.", workers: 8, issues: "Need gypsum boards tomorrow morning.", progress: 65, image: "assets/images/style_modern.png", date: new Date(Date.now() - 3600000 * 2).toISOString(), author: "Ramesh" },
            { id: "upd-2", project_id: "proj-2", work_done: "Kitchen tiling framing grid marked and leveling completed.", workers: 6, issues: "Water pressure blockages on third tier.", progress: 40, image: "assets/images/plan_kitchen.png", date: new Date(Date.now() - 3600000 * 6).toISOString(), author: "Suresh" },
            { id: "upd-3", project_id: "proj-3", work_done: "Glass partitions installed in executive conference rooms.", workers: 12, issues: "None", progress: 85, image: "assets/images/style_industrial.png", date: new Date(Date.now() - 3600000 * 24).toISOString(), author: "Amit" }
        ],
        tasks: [
            { id: "tsk-1", project_id: "proj-1", title: "Living room False ceiling framing & board work", deadline: "2026-06-02", assignee: "Ramesh", status: "In Progress" },
            { id: "tsk-2", project_id: "proj-1", title: "Dining area primer painting", deadline: "2026-06-08", assignee: "Ramesh", status: "Pending" },
            { id: "tsk-3", project_id: "proj-2", title: "Modular kitchen cabinet alignment", deadline: "2026-06-05", assignee: "Suresh", status: "In Progress" },
            { id: "tsk-4", project_id: "proj-2", title: "Bathroom tiling lay down check", deadline: "2026-06-01", assignee: "Suresh", status: "Pending" },
            { id: "tsk-5", project_id: "proj-3", title: "Electrical duct wire harness connection", deadline: "2026-05-31", assignee: "Amit", status: "Completed" }
        ],
        materials: [
            { id: "mat-1", project_id: "proj-1", items: "20 Gypsum boards (12mm), 5 bags structural cement", date: new Date(Date.now() - 3600000 * 4).toISOString(), status: "Pending" },
            { id: "mat-2", project_id: "proj-2", items: "15 Boxes Kajaria ceramic tiling (Grey, 2x2)", date: new Date(Date.now() - 3600000 * 12).toISOString(), status: "Approved" },
            { id: "mat-3", project_id: "proj-3", items: "3 rolls Finolex copper wires (2.5 sq mm)", date: new Date(Date.now() - 3600000 * 48).toISOString(), status: "Delivered" }
        ],
        expenses: [
            { id: "exp-1", project_id: "proj-1", title: "Framing Channel structural steel rods transport", category: "Transport", amount: 2000, author: "Ramesh", date: "2026-05-29" },
            { id: "exp-2", project_id: "proj-1", title: "Labor advance helpers weekly allocation", category: "Labor Advance", amount: 5000, author: "Ramesh", date: "2026-05-28" },
            { id: "exp-3", project_id: "proj-1", title: "Refreshments & snacks for plaster team", category: "Snacks / Welfare", amount: 500, author: "Ramesh", date: "2026-05-29" }
        ],
        staff: [
            { id: "stf-1", name: "Ramesh Patil", role: "Site Manager", project_id: "proj-1", phone: "+91 99000 11000", present: true },
            { id: "stf-2", name: "Suresh Gowda", role: "Site Manager", project_id: "proj-2", phone: "+91 99000 22000", present: true },
            { id: "stf-3", name: "Amit Sharma", role: "Site Manager", project_id: "proj-3", phone: "+91 99000 33000", present: false },
            { id: "stf-4", name: "Kishore Kumar", role: "Plumber Specialist", project_id: "proj-2", phone: "+91 98000 44000", present: true },
            { id: "stf-5", name: "Arjun Singh", role: "Electrician Specialist", project_id: "proj-1", phone: "+91 97000 55000", present: true },
            { id: "stf-6", name: "Dharmesh Shah", role: "Painter Specialist", project_id: "proj-3", phone: "+91 96000 66000", present: false }
        ],
        whatsapp_logs: [
            { id: "wa-1", chat: "admin", text: "🔔 *Site Log:* Suresh logged work on Flat B. Progress: 40%. Workers: 6. Issues: Water pressure blockages on third tier.", time: "18:20" },
            { id: "wa-2", chat: "suresh", text: "✅ *Log Received:* Suresh, your daily update and status for Flat B (40%) has been successfully logged into 9 Square Infra database.", time: "18:21" },
            { id: "wa-3", chat: "admin", text: "🔔 *Site Log:* Ramesh logged progress on Villa A. Progress: 65%. Workers: 8. Issues: Need gypsum boards tomorrow.", time: "22:15" },
            { id: "wa-4", chat: "ramesh", text: "⚠️ *Milestone Alert:* Ramesh, your task 'Living room False ceiling framing' is due on June 2. Ensure gypsum supply tomorrow.", time: "22:16" }
        ]
    };

    // --- DATABASE UTILS ---
    function loadState() {
        const localState = localStorage.getItem('9S_infra_portal_state');
        if (localState) {
            try {
                state = JSON.parse(localState);
            } catch (e) {
                console.error("Failed to parse localStorage state. Seeding fresh data.", e);
                state = seedData;
                saveState();
            }
        } else {
            state = seedData;
            saveState();
        }
    }

    function saveState() {
        localStorage.setItem('9S_infra_portal_state', JSON.stringify(state));
    }

    function getProjectName(projectId) {
        const proj = state.projects.find(p => p.id === projectId);
        return proj ? proj.name : "Unknown Project";
    }

    // --- SESSION / ROLE MANAGER ---
    let currentRole = 'admin'; // 'admin', 'ramesh', 'suresh'

    const userRoleSelect = document.getElementById('user-role-select');
    const activeProfileName = document.getElementById('active-profile-name');

    userRoleSelect.addEventListener('change', (e) => {
        setRole(e.target.value);
    });

    function setRole(role) {
        currentRole = role;
        document.body.setAttribute('data-role', role);
        localStorage.setItem('9S_active_role', role);
        
        // Update visual profiles indicators
        if (role === 'admin') {
            activeProfileName.textContent = "Admin Dashboard";
            document.getElementById('page-title').textContent = "Executive Dashboard";
            document.getElementById('page-subtitle').textContent = "Real-time construction control & interior site monitoring";
            
            // Switch tabs panel back to dashboard if manager dashboard is selected
            const activeTab = document.querySelector('.sidebar-nav .nav-item.active').getAttribute('data-tab');
            if (activeTab === 'dashboard') {
                document.getElementById('panel-manager-dashboard').classList.remove('active');
                document.getElementById('panel-dashboard').classList.add('active');
            }
        } else {
            const managerName = role.charAt(0).toUpperCase() + role.slice(1);
            activeProfileName.textContent = `Site Manager: ${managerName}`;
            document.getElementById('page-title').textContent = `${managerName}'s Workspace`;
            document.getElementById('page-subtitle').textContent = "Mobile-friendly field logging forms";
            
            // Swap active dashboard visual representation
            const activeTab = document.querySelector('.sidebar-nav .nav-item.active').getAttribute('data-tab');
            if (activeTab === 'dashboard') {
                document.getElementById('panel-dashboard').classList.remove('active');
                document.getElementById('panel-manager-dashboard').classList.add('active');
            }
            
            // Setup manager specific welcome values
            setupManagerWelcomePanel(role);
        }
        
        // Redraw active views to reflect permissions / filters
        renderAllPanels();
    }

    function setupManagerWelcomePanel(managerKey) {
        const name = managerKey === 'ramesh' ? "Ramesh Patil" : "Suresh Gowda";
        const projectId = managerKey === 'ramesh' ? "proj-1" : "proj-2";
        const proj = state.projects.find(p => p.id === projectId);
        
        if (proj) {
            document.getElementById('mgr-welcome-title').innerHTML = `Namaste, ${managerKey.charAt(0).toUpperCase() + managerKey.slice(1)}!`;
            document.getElementById('mgr-assigned-project-tag').textContent = `${proj.name} Scope`;
            document.getElementById('mgr-assigned-project-name').textContent = proj.name;
            
            // SVG Circle Progress updates
            document.getElementById('mgr-progress-text').textContent = `${proj.progress}%`;
            document.getElementById('mgr-progress-svg').setAttribute('stroke-dasharray', `${proj.progress}, 100`);
            
            // Pre-fill manager inputs
            document.getElementById('mgr-progress-range').value = proj.progress;
            document.getElementById('mgr-range-val').textContent = `${proj.progress}%`;
        }
    }

    // --- TAB NAVIGATION MANAGER ---
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const tabPanels = document.querySelectorAll('.tab-panel');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab');
            
            // Toggle active menu highlight
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Switch main panels active
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            if (tabId === 'dashboard') {
                if (currentRole === 'admin') {
                    document.getElementById('panel-dashboard').classList.add('active');
                } else {
                    document.getElementById('panel-manager-dashboard').classList.add('active');
                }
            } else {
                document.getElementById(`panel-${tabId}`).classList.add('active');
            }
            
            // Update Page Header Titles
            const titleMap = {
                dashboard: currentRole === 'admin' ? "Executive Dashboard" : `${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}'s Workspace`,
                projects: "Project Index",
                tasks: "Trello Task Tracker",
                materials: "Materials Indent Control",
                expenses: "Voucher Expenses tracker",
                photos: "Live Visual Monitoring Gallery",
                estimations: "Premium Cost Estimations",
                staff: "Organizational Staff Registry",
                whatsapp: "WhatsApp Gateway Simulation logs"
            };
            const subtitleMap = {
                dashboard: currentRole === 'admin' ? "Real-time construction control & interior site monitoring" : "Mobile-friendly field logging forms",
                projects: "Browse, filter and register structural and luxury interior client contracts",
                tasks: "Manage structural deadlines, progress lanes, and manager allocations",
                materials: "Site manager material indents, approvals, and dispatch alerts",
                expenses: "Track cash vouchers, project accounts, and daily expenditure graphs",
                photos: "High-resolution progressive updates captured directly on-site",
                estimations: "Draft client bills, load structural presets, and print PDF sheets",
                staff: "Record on-site attendance metrics, roles, and employee directories",
                whatsapp: "Trace the background notification triggers fired to managers and clients"
            };
            
            document.getElementById('page-title').textContent = titleMap[tabId];
            document.getElementById('page-subtitle').textContent = subtitleMap[tabId];
            
            renderPanel(tabId);
        });
    });

    // Deep navigation helper (widget click -> tabs switch)
    document.querySelectorAll('[data-tab-nav]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = el.getAttribute('data-tab-nav');
            const targetNav = document.querySelector(`.sidebar-nav .nav-item[data-tab='${targetTab}']`);
            if (targetNav) targetNav.click();
        });
    });


    // --- RENDERING HANDLERS FOR EACH MODULE ---
    
    function renderAllPanels() {
        renderPanel('dashboard');
        renderPanel('projects');
        renderPanel('tasks');
        renderPanel('materials');
        renderPanel('expenses');
        renderPanel('photos');
        renderPanel('staff');
        renderPanel('whatsapp');
    }

    function renderPanel(tabId) {
        switch (tabId) {
            case 'dashboard':
                if (currentRole === 'admin') {
                    renderAdminDashboard();
                } else {
                    renderManagerDashboard();
                }
                break;
            case 'projects':
                renderProjectsPanel();
                break;
            case 'tasks':
                renderTasksPanel();
                break;
            case 'materials':
                renderMaterialsPanel();
                break;
            case 'expenses':
                renderExpensesPanel();
                break;
            case 'photos':
                renderPhotosPanel();
                break;
            case 'estimations':
                renderEstimationsPanel();
                break;
            case 'staff':
                renderStaffPanel();
                break;
            case 'whatsapp':
                renderWhatsAppLogs();
                break;
        }
    }

    // --- 1. ADMIN DASHBOARD RENDER ---
    function renderAdminDashboard() {
        // Calculate Metrics values
        const activeProjs = state.projects.filter(p => p.status === 'Running').length;
        const pendingTs = state.tasks.filter(t => t.status !== 'Completed').length;
        const delayedProjs = state.projects.filter(p => p.status === 'Delayed').length;
        const activeMats = state.materials.filter(m => m.status === 'Pending').length;
        
        // Sum total monthly spend
        const totalExp = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        
        // Attendance present rate
        const activeStaff = state.staff.length;
        const presentStaff = state.staff.filter(s => s.present).length;
        const attendRate = activeStaff > 0 ? Math.round((presentStaff / activeStaff) * 100) : 0;
        
        // Set metrics displays
        document.getElementById('m-active-projects').textContent = activeProjs;
        document.getElementById('m-pending-tasks').textContent = pendingTs;
        document.getElementById('m-material-reqs').textContent = activeMats;
        document.getElementById('m-delayed-proj').textContent = delayedProjs;
        document.getElementById('m-total-expenses').textContent = `₹${totalExp.toLocaleString('en-IN')}`;
        
        // Calculate average progress
        const avgProg = state.projects.length > 0 ? Math.round(state.projects.reduce((sum, p) => sum + p.progress, 0) / state.projects.length) : 0;
        document.getElementById('m-today-progress').textContent = `${avgProg}%`;

        // Render projects table
        const tbody = document.getElementById('admin-projects-table-body');
        tbody.innerHTML = '';
        
        state.projects.forEach(proj => {
            const tr = document.createElement('tr');
            
            // Progress Bar render style
            const isDelayed = proj.status === 'Delayed';
            const progressBarClass = isDelayed ? 'progress-fill delayed-fill' : 'progress-fill';
            const badgeClass = proj.status.toLowerCase() === 'running' ? 'badge-status running' : (proj.status.toLowerCase() === 'delayed' ? 'badge-status delayed' : 'badge-status completed');

            tr.innerHTML = `
                <td data-label="Project"><strong>${proj.name}</strong></td>
                <td data-label="Client Name">${proj.client}</td>
                <td data-label="Progress">
                    <div class="progress-bar-container">
                        <div class="progress-track">
                            <div class="${progressBarClass}" style="width: ${proj.progress}%;"></div>
                        </div>
                        <span class="progress-pct">${proj.progress}%</span>
                    </div>
                </td>
                <td data-label="Site Manager"><i class="fa-solid fa-user-gear"></i> ${proj.manager}</td>
                <td data-label="Status"><span class="${badgeClass}">${proj.status}</span></td>
                <td data-label="Actions" class="text-right">
                    <button class="btn-secondary btn-small btn-view-proj" data-proj-id="${proj.id}" title="View Details"><i class="fa-solid fa-magnifying-glass"></i> View</button>
                    <button class="btn-decline btn-small btn-del-proj" data-proj-id="${proj.id}" title="Delete Project"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Add action listeners to projects list buttons
        document.querySelectorAll('.btn-view-proj').forEach(btn => {
            btn.addEventListener('click', () => {
                const projId = btn.getAttribute('data-proj-id');
                const targetProj = state.projects.find(p => p.id === projId);
                if (targetProj) {
                    alert(`Project Name: ${targetProj.name}\nClient: ${targetProj.client}\nAssigned Manager: ${targetProj.manager}\nStatus: ${targetProj.status}\nProgress: ${targetProj.progress}%\n\nYou can toggle your dashboard role to this manager from the sidebar dropdown to record updates!`);
                }
            });
        });

        document.querySelectorAll('.btn-del-proj').forEach(btn => {
            btn.addEventListener('click', () => {
                const projId = btn.getAttribute('data-proj-id');
                if (confirm("Are you sure you want to delete this project and all its associated updates? This action cannot be undone.")) {
                    state.projects = state.projects.filter(p => p.id !== projId);
                    state.tasks = state.tasks.filter(t => t.project_id !== projId);
                    state.updates = state.updates.filter(u => u.project_id !== projId);
                    state.expenses = state.expenses.filter(e => e.project_id !== projId);
                    saveState();
                    renderAdminDashboard();
                    triggerWhatsAppAlert("admin", `🗑️ *Project Removed:* Admin deleted project ID: ${projId} from database.`);
                }
            });
        });

        // Render live site updates feed
        const feedBox = document.getElementById('admin-feed-updates');
        feedBox.innerHTML = '';
        
        // Sort updates descending by date
        const sortedUpdates = [...state.updates].sort((a,b) => new Date(b.date) - new Date(a.date));
        
        if (sortedUpdates.length === 0) {
            feedBox.innerHTML = `<div class="uploader-note text-center" style="padding: 20px;">No updates logged yet today.</div>`;
        } else {
            sortedUpdates.forEach(upd => {
                const dateObj = new Date(upd.date);
                const timeString = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                const projName = getProjectName(upd.project_id);
                
                const feedItem = document.createElement('div');
                feedItem.className = 'feed-item';
                feedItem.innerHTML = `
                    <div class="feed-icon"><i class="fa-solid fa-trowel-bricks"></i></div>
                    <div class="feed-content">
                        <h5>${upd.author} updated <strong>${projName}</strong></h5>
                        <p class="work-desc">"${upd.work_done}"</p>
                        <p class="workers-info"><i class="fa-solid fa-users"></i> Workers on-site: <strong>${upd.workers}</strong> | Progress: <strong>${upd.progress}%</strong></p>
                        ${upd.issues && upd.issues !== "None" ? `<p class="issue-info" style="color: var(--orange); margin-top:4px;"><i class="fa-solid fa-triangle-exclamation"></i> Issue: <strong>"${upd.issues}"</strong></p>` : ''}
                        <span class="feed-time">${timeString} today</span>
                    </div>
                `;
                feedBox.appendChild(feedItem);
            });
        }

        // Render quick materials approvals
        const quickMats = document.getElementById('admin-quick-materials');
        quickMats.innerHTML = '';
        
        const pendingMats = state.materials.filter(m => m.status === 'Pending');
        document.getElementById('badge-materials-count').textContent = `${pendingMats.length} Pending`;
        
        if (pendingMats.length === 0) {
            quickMats.innerHTML = `<div class="uploader-note text-center" style="padding: 20px;"><i class="fa-solid fa-circle-check" style="color: var(--green);"></i> All requests cleared!</div>`;
        } else {
            pendingMats.forEach(req => {
                const projName = getProjectName(req.project_id);
                const itemDiv = document.createElement('div');
                itemDiv.className = 'list-item-req';
                itemDiv.innerHTML = `
                    <div class="req-info">
                        <h4>${projName}</h4>
                        <p>"${req.items}"</p>
                        <span class="req-meta"><i class="fa-solid fa-clock"></i> Requested: ${new Date(req.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div class="req-actions">
                        <button class="btn-icon-only btn-approve btn-approve-mat" data-mat-id="${req.id}"><i class="fa-solid fa-check"></i></button>
                        <button class="btn-icon-only btn-decline btn-decline-mat" data-mat-id="${req.id}"><times>&times;</times></button>
                    </div>
                `;
                quickMats.appendChild(itemDiv);
            });

            // Approval actions
            document.querySelectorAll('.btn-approve-mat').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-mat-id');
                    const req = state.materials.find(m => m.id === id);
                    if (req) {
                        req.status = 'Approved';
                        saveState();
                        renderAdminDashboard();
                        
                        const proj = state.projects.find(p => p.id === req.project_id);
                        const managerName = proj ? proj.manager.toLowerCase() : "ramesh";
                        
                        triggerWhatsAppAlert("admin", `✅ *Material Approved:* Indent for ${proj ? proj.name : "site"} was approved: "${req.items}". Dispatch is initiated.`);
                        triggerWhatsAppAlert(managerName, `✅ *Indent Approved:* Hey ${proj ? proj.manager : "Manager"}, your request for: "${req.items}" has been *Approved* by Admin. Materials dispatched.`);
                    }
                });
            });

            document.querySelectorAll('.btn-decline-mat').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-mat-id');
                    const req = state.materials.find(m => m.id === id);
                    if (req) {
                        req.status = 'Declined';
                        saveState();
                        renderAdminDashboard();
                        
                        const proj = state.projects.find(p => p.id === req.project_id);
                        const managerName = proj ? proj.manager.toLowerCase() : "ramesh";
                        triggerWhatsAppAlert(managerName, `❌ *Indent Declined:* Hey ${proj ? proj.manager : "Manager"}, your request for: "${req.items}" has been *Declined/Held* by Admin. Contact office for details.`);
                    }
                });
            });
        }

        // Render quick recent visual gallery
        const quickPhotos = document.getElementById('admin-quick-photos');
        quickPhotos.innerHTML = '';
        
        // Take updates with valid photos
        const photoUpdates = state.updates.filter(u => u.image).slice(0, 4);
        
        if (photoUpdates.length === 0) {
            quickPhotos.innerHTML = `<div class="uploader-note text-center grid-col-2" style="padding: 20px;">No site photos loaded yet.</div>`;
        } else {
            photoUpdates.forEach(upd => {
                const projName = getProjectName(upd.project_id);
                const photoCard = document.createElement('div');
                photoCard.className = 'visual-photo-card';
                photoCard.innerHTML = `
                    <img src="${upd.image}" alt="Site Photo Update">
                    <div class="photo-overlay">
                        <strong>${projName}</strong>
                        <span>By ${upd.author}</span>
                    </div>
                `;
                quickPhotos.appendChild(photoCard);
            });
        }
    }

    // --- 1B. MANAGER SITE DASHBOARD RENDER ---
    function renderManagerDashboard() {
        const projectId = currentRole === 'ramesh' ? 'proj-1' : 'proj-2';
        const project = state.projects.find(p => p.id === projectId);
        
        if (!project) return;
        
        // Load manager specific attendance checklists
        const attendList = document.getElementById('mgr-attendance-list');
        attendList.innerHTML = '';
        
        const projectStaff = state.staff.filter(s => s.project_id === projectId);
        
        if (projectStaff.length === 0) {
            attendList.innerHTML = `<div class="uploader-note">No employees allocated to your project. Add staff first!</div>`;
        } else {
            projectStaff.forEach(emp => {
                const row = document.createElement('div');
                row.className = `attendance-row-chk ${emp.present ? 'present' : ''}`;
                row.setAttribute('data-staff-id', emp.id);
                row.innerHTML = `
                    <div class="chk-left">
                        <div class="chk-custom"><i class="fa-solid fa-check"></i></div>
                        <div>
                            <strong>${emp.name}</strong>
                            <span> - ${emp.role}</span>
                        </div>
                    </div>
                    <span class="badge-status ${emp.present ? 'online' : 'completed'}">${emp.present ? 'Present' : 'Absent'}</span>
                `;
                
                // Toggle present row locally on click (before locking)
                row.addEventListener('click', () => {
                    emp.present = !emp.present;
                    row.classList.toggle('present');
                    row.querySelector('.badge-status').className = `badge-status ${emp.present ? 'online' : 'completed'}`;
                    row.querySelector('.badge-status').textContent = emp.present ? 'Present' : 'Absent';
                });
                
                attendList.appendChild(row);
            });
        }
    }

    // Site Manager logs attendance
    const mgrAttendForm = document.getElementById('mgr-attendance-form');
    mgrAttendForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveState();
        const managerName = currentRole.charAt(0).toUpperCase() + currentRole.slice(1);
        const projectId = currentRole === 'ramesh' ? 'proj-1' : 'proj-2';
        const proj = state.projects.find(p => p.id === projectId);
        
        alert("Attendance successfully locked for today!");
        
        const presentCount = state.staff.filter(s => s.project_id === projectId && s.present).length;
        const totalCount = state.staff.filter(s => s.project_id === projectId).length;
        
        triggerWhatsAppAlert("admin", `👥 *Attendance Logged:* Manager ${managerName} locked attendance for ${proj ? proj.name : "site"}. Present today: *${presentCount}/${totalCount} staff members*.`);
        triggerWhatsAppAlert(currentRole, `👥 *Attendance Confirmed:* You logged attendance checklist. Active counts: *${presentCount}/${totalCount}* present on site.`);
    });

    // Site Manager submits a daily progress log
    const mgrUpdateForm = document.getElementById('mgr-update-form');
    const mgrProgressRange = document.getElementById('mgr-progress-range');
    const mgrRangeVal = document.getElementById('mgr-range-val');

    mgrProgressRange.addEventListener('input', () => {
        mgrRangeVal.textContent = `${mgrProgressRange.value}%`;
    });

    // Preset mock photos select handler
    const mockPresetBtns = document.querySelectorAll('.mock-presets .preset-btn');
    const hiddenPhotoUrl = document.getElementById('mgr-mock-photo-url');
    
    mockPresetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            mockPresetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            hiddenPhotoUrl.value = btn.getAttribute('data-img');
        });
    });

    mgrUpdateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const projectId = currentRole === 'ramesh' ? 'proj-1' : 'proj-2';
        const project = state.projects.find(p => p.id === projectId);
        
        if (!project) return;
        
        const workDone = document.getElementById('mgr-work-done').value.trim();
        const workers = parseInt(document.getElementById('mgr-workers').value) || 1;
        const progress = parseInt(mgrProgressRange.value);
        const issuesVal = document.getElementById('mgr-issues').value.trim() || "None";
        const photoUrl = hiddenPhotoUrl.value;
        const managerName = currentRole.charAt(0).toUpperCase() + currentRole.slice(1);

        // Update project stats
        project.progress = progress;
        if (issuesVal !== "None" && issuesVal.length > 5) {
            project.status = 'Delayed';
        } else {
            project.status = 'Running';
        }
        
        // Log update
        const newUpdate = {
            id: `upd-${Date.now()}`,
            project_id: projectId,
            work_done: workDone,
            workers: workers,
            issues: issuesVal,
            progress: progress,
            image: photoUrl,
            date: new Date().toISOString(),
            author: managerName
        };
        
        state.updates.unshift(newUpdate);
        saveState();
        
        // Reset and alerts
        document.getElementById('mgr-work-done').value = '';
        document.getElementById('mgr-issues').value = '';
        setupManagerWelcomePanel(currentRole);
        
        alert("Daily site progress logged successfully!");
        
        // Simulated WhatsApp Firing
        triggerWhatsAppAlert("admin", `🔔 *Site Log:* ${managerName} updated *${project.name}*.\nProgress: *${progress}%* | Workers: *${workers}*\nWork Done: "${workDone}"\nIssues: *${issuesVal}*`);
        triggerWhatsAppAlert(currentRole, `✅ *Log Saved:* Hey ${managerName}, your progress report for *${project.name}* (Progress: *${progress}%*) has been compiled and shared with Admin.`);
        
        // Update stats
        renderPanel('dashboard');
    });

    // Site Manager adds daily site expense voucher
    const mgrExpenseForm = document.getElementById('mgr-expense-form');
    mgrExpenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const projectId = currentRole === 'ramesh' ? 'proj-1' : 'proj-2';
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return;
        
        const title = document.getElementById('mgr-exp-title').value.trim();
        const amount = parseInt(document.getElementById('mgr-exp-amount').value) || 0;
        const category = document.getElementById('mgr-exp-category').value;
        const managerName = currentRole.charAt(0).toUpperCase() + currentRole.slice(1);
        
        const newExpense = {
            id: `exp-${Date.now()}`,
            project_id: projectId,
            title: title,
            category: category,
            amount: amount,
            author: managerName,
            date: new Date().toISOString().split('T')[0]
        };
        
        state.expenses.unshift(newExpense);
        saveState();
        
        document.getElementById('mgr-exp-title').value = '';
        document.getElementById('mgr-exp-amount').value = '';
        
        alert("Daily cash expense voucher recorded!");
        
        triggerWhatsAppAlert("admin", `💰 *Expense Voucher:* Site Manager ${managerName} logged expense for *${project.name}*.\nAmount: *₹${amount.toLocaleString('en-IN')}*\nTitle: "${title}" [Category: ${category}]`);
        triggerWhatsAppAlert(currentRole, `💰 *Voucher Recorded:* Expense of *₹${amount.toLocaleString('en-IN')}* for "${title}" successfully recorded to site expenses budget.`);
        
        renderPanel('dashboard');
    });

    // Site Manager requests raw materials
    const mgrMaterialForm = document.getElementById('mgr-material-form');
    mgrMaterialForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const projectId = currentRole === 'ramesh' ? 'proj-1' : 'proj-2';
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return;
        
        const items = document.getElementById('mgr-mat-items').value.trim();
        const managerName = currentRole.charAt(0).toUpperCase() + currentRole.slice(1);
        
        const newReq = {
            id: `mat-${Date.now()}`,
            project_id: projectId,
            items: items,
            date: new Date().toISOString(),
            status: "Pending"
        };
        
        state.materials.unshift(newReq);
        saveState();
        
        document.getElementById('mgr-mat-items').value = '';
        alert("Material request successfully sent to Admin!");
        
        triggerWhatsAppAlert("admin", `🧱 *Material Request:* Site Manager ${managerName} requested indent for *${project.name}*:\n"${items}". Please review and click Approve in the portal.`);
        triggerWhatsAppAlert(currentRole, `🧱 *Indent Sent:* Your request for: "${items}" has been submitted to Admin. You will receive an automated WhatsApp confirmation upon approval.`);
        
        renderPanel('dashboard');
    });


    // --- 2. PROJECTS PANEL RENDER ---
    function renderProjectsPanel() {
        const grid = document.getElementById('projects-list-grid');
        grid.innerHTML = '';
        
        const query = document.getElementById('project-search-input').value.toLowerCase().trim();
        
        const filteredProjs = state.projects.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.client.toLowerCase().includes(query) || 
            p.manager.toLowerCase().includes(query) ||
            p.status.toLowerCase().includes(query)
        );
        
        if (filteredProjs.length === 0) {
            grid.innerHTML = `<div class="uploader-note text-center grid-col-2" style="padding: 40px; width: 100%;">No projects match your search criteria.</div>`;
            return;
        }
        
        filteredProjs.forEach(proj => {
            const card = document.createElement('div');
            card.className = 'project-card-block bg-glass';
            
            const badgeClass = proj.status.toLowerCase() === 'running' ? 'badge-status running' : (proj.status.toLowerCase() === 'delayed' ? 'badge-status delayed' : 'badge-status completed');
            const isDelayed = proj.status === 'Delayed';
            const progressBarClass = isDelayed ? 'progress-fill delayed-fill' : 'progress-fill';
            
            // Calculate project specific expenses
            const projSpend = state.expenses.filter(e => e.project_id === proj.id).reduce((sum, e) => sum + e.amount, 0);
            
            // Calculate active tasks count
            const activeTasksCount = state.tasks.filter(t => t.project_id === proj.id && t.status !== 'Completed').length;
            
            card.innerHTML = `
                <div class="proj-header">
                    <div>
                        <h3>${proj.name}</h3>
                        <p><i class="fa-solid fa-user"></i> Client: <strong>${proj.client}</strong></p>
                    </div>
                    <span class="${badgeClass}">${proj.status}</span>
                </div>
                
                <div class="progress-bar-container">
                    <div class="progress-track">
                        <div class="${progressBarClass}" style="width: ${proj.progress}%;"></div>
                    </div>
                    <span class="progress-pct">${proj.progress}%</span>
                </div>

                <div class="proj-stats-row">
                    <div class="proj-stat-cell">
                        <span>Site Manager</span>
                        <strong>${proj.manager}</strong>
                    </div>
                    <div class="proj-stat-cell">
                        <span>Site Spend</span>
                        <strong>₹${projSpend.toLocaleString('en-IN')}</strong>
                    </div>
                    <div class="proj-stat-cell" style="grid-column: span 2; margin-top:8px;">
                        <span>Pending Milestones</span>
                        <strong>${activeTasksCount} Active Tasks</strong>
                    </div>
                </div>
                
                <div style="display:flex; gap:10px; justify-content:flex-end;">
                    <button class="btn-secondary btn-small btn-view-proj-detail" data-id="${proj.id}"><i class="fa-solid fa-list-check"></i> Manage</button>
                </div>
            `;
            grid.appendChild(card);
        });

        document.querySelectorAll('.btn-view-proj-detail').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const targetNav = document.querySelector(`.sidebar-nav .nav-item[data-tab='tasks']`);
                if (targetNav) targetNav.click();
            });
        });
    }

    // Project search query bind
    document.getElementById('project-search-input').addEventListener('input', renderProjectsPanel);

    // Add New Project Action
    const openProjModal = document.getElementById('open-new-project-modal');
    const openProjModal2 = document.getElementById('open-new-project-modal-2');
    const projModalOverlay = document.getElementById('modal-new-project');
    const newProjForm = document.getElementById('form-new-project');

    [openProjModal, openProjModal2].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                // Populate managers list or select standard options
                projModalOverlay.classList.add('active');
            });
        }
    });

    newProjForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('np-name').value.trim();
        const client = document.getElementById('np-client').value.trim();
        const manager = document.getElementById('np-manager').value;
        const status = document.getElementById('np-status').value;
        const progress = parseInt(document.getElementById('np-progress').value) || 0;
        
        const newProj = {
            id: `proj-${Date.now()}`,
            name: name,
            client: client,
            manager: manager,
            status: status,
            progress: progress
        };
        
        state.projects.push(newProj);
        saveState();
        
        newProjForm.reset();
        projModalOverlay.classList.remove('active');
        
        alert(`New Project '${name}' successfully registered!`);
        triggerWhatsAppAlert("admin", `🏗️ *New Project Registered:* Director registered *${name}* for client *${client}*. Allocated to: Site Manager *${manager}*.`);
        
        renderPanel('dashboard');
        renderPanel('projects');
    });


    // --- 3. TASKS PANEL RENDER ---
    let currentTaskFilter = 'all';

    function renderTasksPanel() {
        // Redraw column headers counts
        document.getElementById('count-col-pending').textContent = state.tasks.filter(t => t.status === 'Pending').length;
        document.getElementById('count-col-inprogress').textContent = state.tasks.filter(t => t.status === 'In Progress').length;
        document.getElementById('count-col-completed').textContent = state.tasks.filter(t => t.status === 'Completed').length;

        // Render Column Cards
        renderTaskColumn('Pending', 'col-pending-cards');
        renderTaskColumn('In Progress', 'col-inprogress-cards');
        renderTaskColumn('Completed', 'col-completed-cards');
    }

    function renderTaskColumn(statusVal, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        let filteredTasks = state.tasks.filter(t => t.status === statusVal);
        
        // Filter by currently selected project if Site Manager is logged in
        if (currentRole !== 'admin') {
            const activeProjId = currentRole === 'ramesh' ? 'proj-1' : 'proj-2';
            filteredTasks = filteredTasks.filter(t => t.project_id === activeProjId);
        }
        
        if (filteredTasks.length === 0) {
            container.innerHTML = `<div class="uploader-note text-center" style="padding: 20px; border: 1px dashed rgba(255,255,255,0.02); border-radius:10px;">No milestones.</div>`;
            return;
        }
        
        filteredTasks.forEach(task => {
            const card = document.createElement('div');
            card.className = 'kanban-card';
            const projName = getProjectName(task.project_id);
            
            // Format actions options
            let actionsHtml = '';
            if (task.status === 'Pending') {
                actionsHtml = `<button class="btn-primary btn-small btn-move-task" data-id="${task.id}" data-to="In Progress">Start <i class="fa-solid fa-arrow-right"></i></button>`;
            } else if (task.status === 'In Progress') {
                actionsHtml = `<button class="btn-approve btn-small btn-move-task" data-id="${task.id}" data-to="Completed">Complete <i class="fa-solid fa-circle-check"></i></button>`;
            } else if (task.status === 'Completed' && currentRole === 'admin') {
                // Admin can delete/reopen
                actionsHtml = `<button class="btn-decline btn-small btn-del-task" data-id="${task.id}"><i class="fa-solid fa-trash"></i></button>`;
            }

            card.innerHTML = `
                <span class="k-project">${projName}</span>
                <h4 class="k-title">${task.title}</h4>
                <div class="k-meta">
                    <span><i class="fa-solid fa-calendar-day"></i> Due: ${task.deadline}</span>
                    <span><i class="fa-solid fa-user-gear"></i> ${task.assignee}</span>
                </div>
                ${actionsHtml ? `<div class="k-actions">${actionsHtml}</div>` : ''}
            `;
            container.appendChild(card);
        });

        // Event triggers
        container.querySelectorAll('.btn-move-task').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const toStatus = btn.getAttribute('data-to');
                const task = state.tasks.find(t => t.id === id);
                if (task) {
                    task.status = toStatus;
                    saveState();
                    renderTasksPanel();
                    
                    const projName = getProjectName(task.project_id);
                    const managerName = task.assignee;
                    
                    triggerWhatsAppAlert("admin", `⏱️ *Task Status Changed:* *${task.title}* (${projName}) was moved to *${toStatus}* by ${managerName}.`);
                    triggerWhatsAppAlert(managerName.toLowerCase(), `⏱️ *Task Progressed:* Hey ${managerName}, you successfully marked milestone *"${task.title}"* as *${toStatus}*. Keep up the progress.`);
                }
            });
        });

        container.querySelectorAll('.btn-del-task').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (confirm("Delete this completed task card?")) {
                    state.tasks = state.tasks.filter(t => t.id !== id);
                    saveState();
                    renderTasksPanel();
                }
            });
        });
    }

    // Task Filter Tabs
    const taskFilters = document.querySelectorAll('[data-task-filter]');
    taskFilters.forEach(tab => {
        tab.addEventListener('click', () => {
            taskFilters.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentTaskFilter = tab.getAttribute('data-task-filter');
            
            // Hide or show columns based on filter
            const cols = document.querySelectorAll('.kanban-col');
            if (currentTaskFilter === 'all') {
                cols.forEach(c => c.style.display = 'flex');
            } else {
                cols.forEach(c => {
                    const colName = c.querySelector('.col-header h4').textContent;
                    if (colName === currentTaskFilter) {
                        c.style.display = 'flex';
                    } else {
                        c.style.display = 'none';
                    }
                });
            }
        });
    });

    // Add New Task Modal actions
    const openTaskModal = document.getElementById('open-new-task-modal');
    const taskModalOverlay = document.getElementById('modal-new-task');
    const taskProjSelect = document.getElementById('nt-project');
    const newTaskForm = document.getElementById('form-new-task');

    if (openTaskModal) {
        openTaskModal.addEventListener('click', () => {
            // Populate project dropdowns
            taskProjSelect.innerHTML = '';
            state.projects.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.name;
                taskProjSelect.appendChild(opt);
            });
            taskModalOverlay.classList.add('active');
        });
    }

    newTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const projectId = taskProjSelect.value;
        const title = document.getElementById('nt-title').value.trim();
        const deadline = document.getElementById('nt-deadline').value;
        const assignee = document.getElementById('nt-assignee').value;
        
        const newTask = {
            id: `tsk-${Date.now()}`,
            project_id: projectId,
            title: title,
            deadline: deadline,
            assignee: assignee,
            status: "Pending"
        };
        
        state.tasks.push(newTask);
        saveState();
        
        newTaskForm.reset();
        taskModalOverlay.classList.remove('active');
        
        alert("Milestone task assigned!");
        const projName = getProjectName(projectId);
        
        triggerWhatsAppAlert("admin", `⏱️ *New Task Issued:* Admin created task *"${title}"* for *${projName}*. Assigned to Site Manager: *${assignee}*. Deadline: ${deadline}`);
        triggerWhatsAppAlert(assignee.toLowerCase(), `⏱️ *Task Assigned:* Hey ${assignee}, Admin has assigned you a new task for *${projName}*:\n*Task:* "${title}"\n*Deadline:* ${deadline}. Log into portal to start.`);
        
        renderTasksPanel();
    });


    // --- 4. MATERIALS PANEL RENDER ---
    function renderMaterialsPanel() {
        const tbody = document.getElementById('materials-archive-table');
        tbody.innerHTML = '';
        
        state.materials.forEach(req => {
            const projName = getProjectName(req.project_id);
            const tr = document.createElement('tr');
            
            const badgeClass = req.status.toLowerCase() === 'pending' ? 'badge-status warning' : (req.status.toLowerCase() === 'approved' ? 'badge-status running' : 'badge-status online');
            
            // Action options depending on role and status
            let actions = '<em>No Actions</em>';
            if (currentRole === 'admin' && req.status === 'Pending') {
                actions = `
                    <button class="btn-approve btn-small btn-table-approve" data-id="${req.id}"><i class="fa-solid fa-check"></i> Approve</button>
                    <button class="btn-decline btn-small btn-table-decline" data-id="${req.id}">Hold</button>
                `;
            } else if (currentRole === 'admin' && req.status === 'Approved') {
                actions = `<button class="btn-primary btn-small btn-table-deliver" data-id="${req.id}" style="background:#2ecc71; border-color:#2ecc71;"><i class="fa-solid fa-truck-fast"></i> Mark Delivered</button>`;
            } else if (req.status === 'Delivered') {
                actions = `<span class="green-text" style="font-size:11px; font-weight:600;"><i class="fa-solid fa-circle-check"></i> Received On Site</span>`;
            }
            
            tr.innerHTML = `
                <td data-label="Project"><strong>${projName}</strong></td>
                <td data-label="Required Materials">${req.items}</td>
                <td data-label="Requested Date">${new Date(req.date).toLocaleDateString([], {day:'2-digit', month:'short'})} ${new Date(req.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                <td data-label="Status"><span class="${badgeClass}">${req.status}</span></td>
                <td data-label="Actions" class="text-right">${actions}</td>
            `;
            tbody.appendChild(tr);
        });

        // Approve
        tbody.querySelectorAll('.btn-table-approve').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const req = state.materials.find(m => m.id === id);
                if (req) {
                    req.status = 'Approved';
                    saveState();
                    renderMaterialsPanel();
                    
                    const proj = state.projects.find(p => p.id === req.project_id);
                    const managerName = proj ? proj.manager.toLowerCase() : "ramesh";
                    triggerWhatsAppAlert("admin", `✅ *Material Approved:* Indent for ${proj ? proj.name : "site"} was approved: "${req.items}". Dispatch is initiated.`);
                    triggerWhatsAppAlert(managerName, `✅ *Indent Approved:* Hey ${proj ? proj.manager : "Manager"}, your request for: "${req.items}" has been *Approved* by Admin.`);
                }
            });
        });

        // Deliver
        tbody.querySelectorAll('.btn-table-deliver').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const req = state.materials.find(m => m.id === id);
                if (req) {
                    req.status = 'Delivered';
                    saveState();
                    renderMaterialsPanel();
                    
                    const proj = state.projects.find(p => p.id === req.project_id);
                    const managerName = proj ? proj.manager.toLowerCase() : "ramesh";
                    
                    triggerWhatsAppAlert("admin", `🚚 *Material Delivered:* Materials: "${req.items}" delivered to *${proj ? proj.name : "site"}*.`);
                    triggerWhatsAppAlert(managerName, `🚚 *Supply Delivered:* Hey ${proj ? proj.manager : "Manager"}, supplies for: "${req.items}" have been *Delivered* on-site. Check and confirm count.`);
                }
            });
        });

        // Hide material quick request box if logged in as Admin (Manager logged forms already handle)
        const requestBlock = document.getElementById('materials-quick-request-block');
        const projSelect = document.getElementById('ad-mat-project');
        
        if (currentRole === 'admin') {
            requestBlock.style.display = 'block';
            projSelect.innerHTML = '';
            state.projects.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.name;
                projSelect.appendChild(opt);
            });
        } else {
            requestBlock.style.display = 'none';
        }
    }

    // Admin creates material request via admin form
    const adminMatForm = document.getElementById('admin-material-form');
    adminMatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const projectId = document.getElementById('ad-mat-project').value;
        const items = document.getElementById('ad-mat-items').value.trim();
        
        const newReq = {
            id: `mat-${Date.now()}`,
            project_id: projectId,
            items: items,
            date: new Date().toISOString(),
            status: "Pending"
        };
        
        state.materials.unshift(newReq);
        saveState();
        
        document.getElementById('ad-mat-items').value = '';
        alert("Admin material request initiated!");
        
        renderMaterialsPanel();
        renderAdminDashboard();
    });


    // --- 5. EXPENSES PANEL RENDER ---
    function renderExpensesPanel() {
        const tbody = document.getElementById('expenses-table-body');
        tbody.innerHTML = '';
        
        const monthlySum = state.expenses.reduce((sum, e) => sum + e.amount, 0);
        document.getElementById('exp-total-monthly').textContent = `₹${monthlySum.toLocaleString('en-IN')}`;

        state.expenses.forEach(exp => {
            const projName = getProjectName(exp.project_id);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td data-label="Project"><strong>${projName}</strong></td>
                <td data-label="Expense Title">${exp.title}</td>
                <td data-label="Category"><span class="badge-status online" style="background:rgba(255,255,255,0.03); color:#fff; border-color:rgba(255,255,255,0.1);">${exp.category}</span></td>
                <td data-label="Amount (₹)"><strong>₹${exp.amount.toLocaleString('en-IN')}</strong></td>
                <td data-label="Logged By"><i class="fa-solid fa-user-pen"></i> ${exp.author}</td>
                <td data-label="Date">${exp.date}</td>
                <td data-label="Action" class="text-right">
                    <button class="btn-decline btn-small btn-del-exp" data-id="${exp.id}" title="Delete Voucher"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        tbody.querySelectorAll('.btn-del-exp').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (confirm("Are you sure you want to delete this expense record?")) {
                    state.expenses = state.expenses.filter(e => e.id !== id);
                    saveState();
                    renderExpensesPanel();
                    renderAdminDashboard();
                }
            });
        });

        // Render project wise chart summaries
        const chartWrapper = document.getElementById('expenses-projects-list');
        chartWrapper.innerHTML = '';
        
        // Calculate spends by project
        const projectSpends = {};
        state.projects.forEach(p => {
            projectSpends[p.id] = { name: p.name, amount: 0 };
        });
        
        state.expenses.forEach(e => {
            if (projectSpends[e.project_id]) {
                projectSpends[e.project_id].amount += e.amount;
            }
        });

        // Find highest spend project
        let highestProjName = "None";
        let highestAmount = 0;

        Object.keys(projectSpends).forEach(id => {
            const data = projectSpends[id];
            if (data.amount > highestAmount) {
                highestAmount = data.amount;
                highestProjName = `${data.name} (₹${data.amount.toLocaleString('en-IN')})`;
            }
            
            // Format percentage of total spent
            const pct = monthlySum > 0 ? Math.round((data.amount / monthlySum) * 100) : 0;
            
            const barRow = document.createElement('div');
            barRow.className = 'chart-bar-row';
            barRow.innerHTML = `
                <div class="chart-label-row">
                    <span>${data.name}</span>
                    <strong>₹${data.amount.toLocaleString('en-IN')} (${pct}%)</strong>
                </div>
                <div class="chart-bar-bg">
                    <div class="chart-bar-fill" style="width: ${pct}%;"></div>
                </div>
            `;
            chartWrapper.appendChild(barRow);
        });

        document.getElementById('exp-highest-project').textContent = highestProjName;
    }


    // --- 6. PHOTOS PANEL RENDER ---
    function renderPhotosPanel() {
        const filtersBox = document.getElementById('photo-project-filters');
        filtersBox.innerHTML = '<button class="btn-tab active" data-photo-filter="all">All Photos</button>';
        
        // Render unique project tabs
        state.projects.forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'btn-tab';
            btn.setAttribute('data-photo-filter', p.id);
            btn.textContent = p.name;
            filtersBox.appendChild(btn);
        });

        renderPhotosMasonry('all');

        // Toggle filter clicks
        filtersBox.querySelectorAll('.btn-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                filtersBox.querySelectorAll('.btn-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderPhotosMasonry(btn.getAttribute('data-photo-filter'));
            });
        });
    }

    function renderPhotosMasonry(filterVal) {
        const masonry = document.getElementById('photos-masonry-grid');
        masonry.innerHTML = '';
        
        let filteredUpdates = state.updates.filter(u => u.image);
        
        if (filterVal !== 'all') {
            filteredUpdates = filteredUpdates.filter(u => u.project_id === filterVal);
        }
        
        if (filteredUpdates.length === 0) {
            masonry.innerHTML = `<div class="uploader-note text-center grid-col-2" style="padding: 40px; width: 100%;">No progress photos registered for this project segment.</div>`;
            return;
        }

        filteredUpdates.forEach(upd => {
            const projName = getProjectName(upd.project_id);
            const card = document.createElement('div');
            card.className = 'photo-masonry-card';
            
            const dateStr = new Date(upd.date).toLocaleDateString([], {day:'2-digit', month:'short'});
            const timeStr = new Date(upd.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
            
            card.innerHTML = `
                <img src="${upd.image}" alt="Site Photo Update">
                <div class="masonry-overlay">
                    <span class="masonry-project-tag">${projName}</span>
                    <h4 class="masonry-title">"${upd.work_done}"</h4>
                    <div class="masonry-meta-row">
                        <span><i class="fa-solid fa-user"></i> Logged: ${upd.author}</span>
                        <span><i class="fa-solid fa-calendar"></i> ${dateStr} at ${timeStr}</span>
                    </div>
                </div>
            `;
            masonry.appendChild(card);
        });
    }


    // --- 7. ESTIMATION GENERATOR PANEL LOGIC ---
    let currentEstimateItems = [];

    // Pre-saved Cost Item presets templates
    const estimatePresets = {
        kitchen: [
            { desc: "Pre-fabricated commercial ply 3BHK Modular Kitchen carcass units", qty: 1, unit: "Lumpsum", rate: 120000, category: "Material" },
            { desc: "High gloss acrylic laminate shutter finish profiles and hydraulic fittings", qty: 15, unit: "Running Ft", rate: 2500, category: "Design" },
            { desc: "Signature Double-Thickness Quartz Granite Countertop laying and sink cut-outs", qty: 12, unit: "Sq. Ft.", rate: 1800, category: "Material" },
            { desc: "Tandem drawer soft close tracks and custom cutlery trays layout", qty: 6, unit: "Nos", rate: 4500, category: "Material" },
            { desc: "Modular kitchen specialist fitting crew & plumbing connection charges", qty: 6, unit: "Days", rate: 1800, category: "Labor" }
        ],
        falseceiling: [
            { desc: "Saint-Gobain Gypboard metal ceiling framing channel layout & installations", qty: 450, unit: "Sq. Ft.", rate: 95, category: "Material" },
            { desc: "12mm High-strength Gypsum boards board-lay and joint taping works", qty: 450, unit: "Sq. Ft.", rate: 45, category: "Material" },
            { desc: "Modular recessed COB spotlights and custom LED strip cove profiles hookup", qty: 8, unit: "Nos", rate: 1200, category: "Material" },
            { desc: "False Ceiling surface finish putty and primer coat application labor", qty: 450, unit: "Sq. Ft.", rate: 30, category: "Labor" },
            { desc: "Scaffolding platforms logistics, erection and site cleaning charges", qty: 1, unit: "Lumpsum", rate: 5000, category: "Misc" }
        ],
        fullvilla: [
            { desc: "Pre-fabricated luxury modular bedroom wardrobes with floor-to-ceiling glass profiles", qty: 2, unit: "Nos", rate: 85000, category: "Design" },
            { desc: "Luxury false ceiling works with designer ambient cove grooves (Outfit specs)", qty: 2200, unit: "Sq. Ft.", rate: 145, category: "Material" },
            { desc: "Pure engineered hardwood parquet flooring planks overlay in master bedrooms", qty: 650, unit: "Sq. Ft.", rate: 350, category: "Material" },
            { desc: "High-end luxury bathroom plumbing wall-hung sanitary fixtures installation", qty: 3, unit: "Nos", rate: 45000, category: "Material" },
            { desc: "Full interior emulsion paint finish with royal accent wallpapers layout", qty: 2200, unit: "Sq. Ft.", rate: 80, category: "Labor" },
            { desc: "Premium architectural designer consult fee, 3D Elevation renders, VR walkthrough package", qty: 1, unit: "Lumpsum", rate: 75000, category: "Design" }
        ]
    };

    function renderEstimationsPanel() {
        const tbody = document.getElementById('estimator-items-tbody');
        tbody.innerHTML = '';
        
        if (currentEstimateItems.length === 0) {
            // Load default blank row
            addEstimateRow();
            return;
        }

        currentEstimateItems.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <input type="text" class="est-item-desc" data-index="${index}" value="${item.desc}" placeholder="Enter work scope description...">
                </td>
                <td>
                    <select class="est-item-cat" data-index="${index}">
                        <option value="Material" ${item.category === 'Material' ? 'selected' : ''}>Material</option>
                        <option value="Labor" ${item.category === 'Labor' ? 'selected' : ''}>Labor</option>
                        <option value="Design" ${item.category === 'Design' ? 'selected' : ''}>Design</option>
                        <option value="Equipment" ${item.category === 'Equipment' ? 'selected' : ''}>Equipment</option>
                        <option value="Misc" ${item.category === 'Misc' ? 'selected' : ''}>Miscellaneous</option>
                    </select>
                </td>
                <td>
                    <input type="number" class="est-item-qty text-right" data-index="${index}" value="${item.qty}" min="0.1" step="any">
                </td>
                <td>
                    <select class="est-item-unit" data-index="${index}">
                        <option value="Sq. Ft." ${item.unit === 'Sq. Ft.' ? 'selected' : ''}>Sq. Ft.</option>
                        <option value="Running Ft" ${item.unit === 'Running Ft' ? 'selected' : ''}>Running Ft</option>
                        <option value="Nos" ${item.unit === 'Nos' ? 'selected' : ''}>Nos</option>
                        <option value="Lumpsum" ${item.unit === 'Lumpsum' ? 'selected' : ''}>Lumpsum</option>
                        <option value="Bags" ${item.unit === 'Bags' ? 'selected' : ''}>Bags</option>
                        <option value="Days" ${item.unit === 'Days' ? 'selected' : ''}>Days</option>
                    </select>
                </td>
                <td>
                    <input type="number" class="est-item-rate text-right" data-index="${index}" value="${item.rate}" min="0">
                </td>
                <td class="text-right" style="padding-top: 20px;">
                    <strong>₹${Math.round(item.qty * item.rate).toLocaleString('en-IN')}</strong>
                </td>
                <td class="text-center">
                    <button class="btn-decline btn-small btn-del-est-row" data-index="${index}" style="padding:4px 8px; border-radius:4px;">&times;</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Binds update calculation triggers
        tbody.querySelectorAll('.est-item-desc').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                currentEstimateItems[idx].desc = e.target.value;
            });
        });

        tbody.querySelectorAll('.est-item-cat').forEach(select => {
            select.addEventListener('change', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                currentEstimateItems[idx].category = e.target.value;
            });
        });

        tbody.querySelectorAll('.est-item-qty').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                currentEstimateItems[idx].qty = parseFloat(e.target.value) || 0;
                calculateEstimateTotals();
                // Debounce simple repaint
                debounceRepaintRow(tr => renderEstimationsPanel());
            });
        });

        tbody.querySelectorAll('.est-item-unit').forEach(select => {
            select.addEventListener('change', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                currentEstimateItems[idx].unit = e.target.value;
            });
        });

        tbody.querySelectorAll('.est-item-rate').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                currentEstimateItems[idx].rate = parseInt(e.target.value) || 0;
                calculateEstimateTotals();
                debounceRepaintRow(tr => renderEstimationsPanel());
            });
        });

        tbody.querySelectorAll('.btn-del-est-row').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.getAttribute('data-index'));
                currentEstimateItems.splice(idx, 1);
                calculateEstimateTotals();
                renderEstimationsPanel();
            });
        });

        calculateEstimateTotals();
    }

    let debounceTimer;
    function debounceRepaintRow(fn) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(fn, 1500); // 1.5s delay so user can type quantities without screen resetting cursor focus
    }

    function addEstimateRow() {
        currentEstimateItems.push({
            desc: "Custom architectural framing / design work",
            qty: 100,
            unit: "Sq. Ft.",
            rate: 150,
            category: "Material"
        });
        renderEstimationsPanel();
    }

    function calculateEstimateTotals() {
        let subtotal = 0;
        currentEstimateItems.forEach(item => {
            subtotal += Math.round(item.qty * item.rate);
        });
        
        const discPct = parseInt(document.getElementById('est-discount-pct').value) || 0;
        const discountAmt = Math.round(subtotal * (discPct / 100));
        
        const taxableAmount = subtotal - discountAmt;
        
        // 9% CGST + 9% SGST (18% overall)
        const cgst = Math.round(taxableAmount * 0.09);
        const sgst = Math.round(taxableAmount * 0.09);
        const grandTotal = taxableAmount + cgst + sgst;
        
        // Display calculations
        document.getElementById('est-calc-subtotal').textContent = `₹${subtotal.toLocaleString('en-IN')}`;
        document.getElementById('est-calc-discount').textContent = `- ₹${discountAmt.toLocaleString('en-IN')}`;
        document.getElementById('est-calc-cgst').textContent = `₹${cgst.toLocaleString('en-IN')}`;
        document.getElementById('est-calc-sgst').textContent = `₹${sgst.toLocaleString('en-IN')}`;
        document.getElementById('est-calc-grandtotal').textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
        
        // Sync print values
        document.getElementById('p-subtotal').textContent = `₹${subtotal.toLocaleString('en-IN')}`;
        document.getElementById('p-discount').textContent = `- ₹${discountAmt.toLocaleString('en-IN')}`;
        document.getElementById('p-cgst').textContent = `₹${cgst.toLocaleString('en-IN')}`;
        document.getElementById('p-sgst').textContent = `₹${sgst.toLocaleString('en-IN')}`;
        document.getElementById('p-grandtotal').textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
    }

    document.getElementById('add-estimate-row-btn').addEventListener('click', addEstimateRow);
    document.getElementById('est-discount-pct').addEventListener('input', calculateEstimateTotals);

    // Apply Estimation Templates Presets
    const loadTemplateBtn = document.getElementById('load-template-btn');
    loadTemplateBtn.addEventListener('click', () => {
        const val = document.getElementById('estimation-template-loader').value;
        if (val && estimatePresets[val]) {
            currentEstimateItems = JSON.parse(JSON.stringify(estimatePresets[val]));
            alert("Template values successfully pre-populated! Feel free to edit rates and quantities.");
            renderEstimationsPanel();
        } else {
            alert("Please select a valid preset template from the dropdown.");
        }
    });

    // Link estimate total to a project
    const saveEstimateBtn = document.getElementById('save-estimate-to-project-btn');
    saveEstimateBtn.addEventListener('click', () => {
        const clientName = document.getElementById('est-client-name').value;
        const totalText = document.getElementById('est-calc-grandtotal').textContent;
        
        // Let user select target project
        const projectNames = state.projects.map((p, idx) => `${idx + 1}. ${p.name}`).join("\n");
        const idxVal = prompt(`Select project number to link estimate of ${totalText}:\n\n${projectNames}`);
        
        if (idxVal) {
            const selectIdx = parseInt(idxVal) - 1;
            if (selectIdx >= 0 && selectIdx < state.projects.length) {
                const targetProj = state.projects[selectIdx];
                
                // Add expense or log note
                alert(`Estimate linked successfully to ${targetProj.name}! Total budget allocated: ${totalText}.`);
                triggerWhatsAppAlert("admin", `📋 *Cost Proposal Linked:* Estimate for client *${clientName}* totaling *${totalText}* was linked to *${targetProj.name}*.`);
            } else {
                alert("Invalid selection index.");
            }
        }
    });

    // Open print trigger
    const printEstimateTrigger = document.getElementById('print-estimate-trigger');
    printEstimateTrigger.addEventListener('click', () => {
        // Sync static descriptors metadata
        document.getElementById('p-est-no').textContent = document.getElementById('est-no').value;
        
        const estDate = new Date(document.getElementById('est-date').value);
        document.getElementById('p-est-date').textContent = estDate.toLocaleDateString([], {day:'2-digit', month:'long', year:'numeric'});
        
        document.getElementById('p-client-name').textContent = document.getElementById('est-client-name').value;
        document.getElementById('p-client-loc').textContent = document.getElementById('est-client-location').value;
        document.getElementById('p-client-phone').textContent = document.getElementById('est-client-phone').value;
        
        // Sync print table body
        const printBody = document.getElementById('print-items-body');
        printBody.innerHTML = '';
        
        currentEstimateItems.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td><strong>${item.desc}</strong></td>
                <td>${item.category}</td>
                <td class="text-right">₹${item.rate.toLocaleString('en-IN')}</td>
                <td class="text-right">${item.qty}</td>
                <td class="text-right">${item.unit}</td>
                <td class="text-right"><strong>₹${Math.round(item.qty * item.rate).toLocaleString('en-IN')}</strong></td>
            `;
            printBody.appendChild(tr);
        });

        // Launch Browser Native Printer Dialog
        window.print();
    });


    // --- 8. STAFF PANEL RENDER ---
    function renderStaffPanel() {
        const tbody = document.getElementById('staff-directory-tbody');
        tbody.innerHTML = '';
        
        state.staff.forEach(emp => {
            const projName = getProjectName(emp.project_id);
            const tr = document.createElement('tr');
            
            const checkedClass = emp.present ? 'present' : '';
            const statusLabel = emp.present ? 'Present' : 'Absent';
            const badgeClass = emp.present ? 'badge-status online' : 'badge-status completed';

            tr.innerHTML = `
                <td data-label="Staff Member"><strong>${emp.name}</strong></td>
                <td data-label="Standard Role">${emp.role}</td>
                <td data-label="Assigned Project"><i class="fa-solid fa-building-flag"></i> ${projName}</td>
                <td data-label="Contact Phone">${emp.phone}</td>
                <td data-label="Attendance Today">
                    <span class="${badgeClass}">${statusLabel}</span>
                </td>
                <td data-label="Action" class="text-right">
                    <button class="btn-secondary btn-small btn-toggle-attend" data-id="${emp.id}"><i class="fa-solid fa-clock-rotate-left"></i> Flip Status</button>
                    <button class="btn-decline btn-small btn-del-staff" data-id="${emp.id}"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        tbody.querySelectorAll('.btn-toggle-attend').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const emp = state.staff.find(s => s.id === id);
                if (emp) {
                    emp.present = !emp.present;
                    saveState();
                    renderStaffPanel();
                    renderAdminDashboard();
                }
            });
        });

        tbody.querySelectorAll('.btn-del-staff').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (confirm("Remove employee from staff directory?")) {
                    state.staff = state.staff.filter(s => s.id !== id);
                    saveState();
                    renderStaffPanel();
                    renderAdminDashboard();
                }
            });
        });

        // Speedometer recalculations
        const activeStaff = state.staff.length;
        const presentStaff = state.staff.filter(s => s.present).length;
        const attendRate = activeStaff > 0 ? Math.round((presentStaff / activeStaff) * 100) : 0;
        
        document.getElementById('staff-attendance-rate').textContent = `${attendRate}%`;

        // Populate details counts list
        const breakBox = document.getElementById('staff-attendance-breakdown');
        breakBox.innerHTML = '';
        
        // Count staff roles allocations
        const roleCounts = {};
        state.staff.forEach(s => {
            roleCounts[s.role] = roleCounts[s.role] ? roleCounts[s.role] + 1 : 1;
        });

        Object.keys(roleCounts).forEach(role => {
            const row = document.createElement('div');
            row.className = 'attend-break-row';
            row.innerHTML = `
                <span>${role}s allocated:</span>
                <span><strong>${roleCounts[role]} staff</strong></span>
            `;
            breakBox.appendChild(row);
        });
    }

    // Register employee Modal actions
    const openStaffModal = document.getElementById('open-add-staff-modal');
    const staffModalOverlay = document.getElementById('modal-new-staff');
    const staffProjSelect = document.getElementById('ns-project');
    const newStaffForm = document.getElementById('form-new-staff');

    if (openStaffModal) {
        openStaffModal.addEventListener('click', () => {
            staffProjSelect.innerHTML = '';
            state.projects.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.name;
                staffProjSelect.appendChild(opt);
            });
            staffModalOverlay.classList.add('active');
        });
    }

    newStaffForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('ns-name').value.trim();
        const role = document.getElementById('ns-role').value;
        const projectId = staffProjSelect.value;
        const phone = document.getElementById('ns-phone').value.trim();
        
        const newEmp = {
            id: `stf-${Date.now()}`,
            name: name,
            role: role,
            project_id: projectId,
            phone: phone,
            present: true // default present when adding
        };
        
        state.staff.push(newEmp);
        saveState();
        
        newStaffForm.reset();
        staffModalOverlay.classList.remove('active');
        
        alert(`Staff member '${name}' successfully registered!`);
        renderStaffPanel();
        renderAdminDashboard();
    });


    // --- 9. WHATSAPP LOGS HUB RENDER ---
    function renderWhatsAppLogs() {
        const feed = document.getElementById('wa-logs-feed-container');
        feed.innerHTML = '';
        
        // Update notification count badge in sidebar
        document.getElementById('wa-log-count').textContent = state.whatsapp_logs.length;
        
        if (state.whatsapp_logs.length === 0) {
            feed.innerHTML = `<div class="uploader-note text-center" style="padding: 20px;">No alerts fired today.</div>`;
            return;
        }

        // Descending chronological listing
        const logsReversed = [...state.whatsapp_logs].reverse();
        
        logsReversed.forEach(log => {
            const card = document.createElement('div');
            card.className = 'wa-log-card';
            card.innerHTML = `
                <div class="wa-log-details">
                    <h4>Channel Recipient: <strong>${log.chat.toUpperCase()} Mobile</strong></h4>
                    <p>${log.text.replace(/\n/g, '<br>')}</p>
                </div>
                <div class="wa-log-meta">${log.time}</div>
            `;
            feed.appendChild(card);
        });

        // Trigger phone mockup views update too
        renderPhoneMockupMessages();
    }

    // Triggers automated system alert
    function triggerWhatsAppAlert(chatRecipient, rawMessage) {
        const timeNow = new Date();
        const timeString = timeNow.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const newLog = {
            id: `wa-${Date.now()}`,
            chat: chatRecipient,
            text: rawMessage,
            time: timeString
        };
        
        state.whatsapp_logs.push(newLog);
        saveState();
        
        // Highlight tab counts & notify
        renderWhatsAppLogs();
    }

    // Clear logs
    document.getElementById('clear-wa-logs-btn').addEventListener('click', () => {
        state.whatsapp_logs = [];
        saveState();
        renderWhatsAppLogs();
    });


    // --- 10. PHONE MOCKUP SLIDER SYSTEM ---
    const phoneSim = document.getElementById('whatsapp-sim-phone');
    const togglePhoneBtn = document.getElementById('toggle-phone-btn');
    const closePhoneBtn = document.getElementById('close-phone-btn');

    togglePhoneBtn.addEventListener('click', () => {
        phoneSim.classList.toggle('collapsed');
    });

    closePhoneBtn.addEventListener('click', () => {
        phoneSim.classList.add('collapsed');
    });

    // Chat tabs inside phone click switches messages
    let activePhoneChannel = 'admin'; // 'admin', 'ramesh', 'suresh'
    const waChatTabs = document.querySelectorAll('.whatsapp-chat-tabs .wa-chat-tab');
    
    waChatTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            waChatTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activePhoneChannel = tab.getAttribute('data-chat-user');
            renderPhoneMockupMessages();
        });
    });

    function renderPhoneMockupMessages() {
        const chatBody = document.getElementById('phone-chat-messages');
        chatBody.innerHTML = '';
        
        const filteredLogs = state.whatsapp_logs.filter(log => log.chat === activePhoneChannel);
        
        if (filteredLogs.length === 0) {
            chatBody.innerHTML = `<div class="uploader-note text-center" style="padding: 40px 10px; color:#6b7280; font-size:11px;">No messages in this chat gateway yet.<br>Submit site updates to see bubbles compile.</div>`;
            return;
        }

        filteredLogs.forEach(log => {
            const bubble = document.createElement('div');
            // Mock system messages as received, confirmations as sent
            const isSent = log.text.includes("Confirmed") || log.text.includes("Saved") || log.text.includes("Voucher Recorded") || log.text.includes("Indent Sent");
            bubble.className = `wa-bubble ${isSent ? 'sent' : 'received'}`;
            
            // Format nice WhatsApp bold syntax *text* into HTML <strong>
            let formattedText = log.text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
            
            bubble.innerHTML = `
                <div class="wa-msg-txt">${formattedText.replace(/\n/g, '<br>')}</div>
                <span class="wa-time">${log.time}</span>
            `;
            chatBody.appendChild(bubble);
        });

        // Scroll phone chat to bottom instantly
        chatBody.scrollTop = chatBody.scrollHeight;
    }


    // --- MODALS CLOSE REGISTERS ---
    document.querySelectorAll('[data-close-modal]').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modalId = closeBtn.getAttribute('data-close-modal');
            document.getElementById(modalId).classList.remove('active');
        });
    });

    // Close on overlay outer click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });


    // --- GENERAL BOOTSTRAPPING ---
    loadState();
    
    // Check if there was an active role in state
    const savedRole = localStorage.getItem('9S_active_role') || 'admin';
    userRoleSelect.value = savedRole;
    
    // Pre-load currentEstimates default with False Ceiling template to be highly visual on open
    currentEstimateItems = JSON.parse(JSON.stringify(estimatePresets.falseceiling));
    
    setRole(savedRole);
    renderAllPanels();
});
