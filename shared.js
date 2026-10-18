// IRCTC Shared Core Engine
// Handles LocalStorage persistence, live search, booking state, PNR tracking, E-Wallet, Loyalty & UI utilities.

const IRCTC = (() => {
    // 1. Station Master Data
    const STATIONS = [
        { code: "NDLS", name: "New Delhi", state: "Delhi" },
        { code: "BCT", name: "Mumbai Central", state: "Maharashtra" },
        { code: "CSMT", name: "Chhatrapati Shivaji Maharaj Terminus", state: "Maharashtra" },
        { code: "NZM", name: "Hazrat Nizamuddin", state: "Delhi" },
        { code: "HWH", name: "Howrah Junction", state: "West Bengal" },
        { code: "SDAH", name: "Sealdah", state: "West Bengal" },
        { code: "MAS", name: "Chennai Central", state: "Tamil Nadu" },
        { code: "SBC", name: "KSR Bengaluru", state: "Karnataka" },
        { code: "ADI", name: "Ahmedabad Junction", state: "Gujarat" },
        { code: "BSB", name: "Varanasi Junction", state: "Uttar Pradesh" },
        { code: "LKO", name: "Lucknow Charbagh", state: "Uttar Pradesh" },
        { code: "PNBE", name: "Patna Junction", state: "Bihar" },
        { code: "JP", name: "Jaipur Junction", state: "Rajasthan" },
        { code: "ASR", name: "Amritsar Junction", state: "Punjab" },
        { code: "PUNE", name: "Pune Junction", state: "Maharashtra" },
        { code: "GKP", name: "Gorakhpur Junction", state: "Uttar Pradesh" },
        { code: "TVC", name: "Thiruvananthapuram Central", state: "Kerala" },
        { code: "HYB", name: "Hyderabad Deccan", state: "Telangana" },
        { code: "CNB", name: "Kanpur Central", state: "Uttar Pradesh" },
        { code: "BZA", name: "Vijayawada Junction", state: "Andhra Pradesh" }
    ];

    // 2. Trains Master Database
    const TRAINS = [
        {
            number: "12951",
            name: "Rajdhani Express",
            fromCode: "NDLS",
            fromName: "New Delhi",
            toCode: "BCT",
            toName: "Mumbai Central",
            depTime: "16:30",
            arrTime: "08:35",
            duration: "16h 05m",
            runsDays: "Daily",
            type: "Rajdhani Superfast",
            classes: {
                "3A": { name: "AC 3 Tier", fare: 1850, status: "AVAILABLE - 0143", avail: true },
                "2A": { name: "AC 2 Tier", fare: 2850, status: "AVAILABLE - 0024", avail: true },
                "1A": { name: "AC First Class", fare: 4850, status: "WL 12", avail: false }
            }
        },
        {
            number: "12953",
            name: "August Kranti Rajdhani",
            fromCode: "NZM",
            fromName: "Hazrat Nizamuddin",
            toCode: "BCT",
            toName: "Mumbai Central",
            depTime: "17:15",
            arrTime: "09:45",
            duration: "16h 30m",
            runsDays: "Daily",
            type: "Rajdhani Superfast",
            classes: {
                "3A": { name: "AC 3 Tier", fare: 1810, status: "WL 45", avail: false },
                "2A": { name: "AC 2 Tier", fare: 2790, status: "AVAILABLE - 0008", avail: true },
                "1A": { name: "AC First Class", fare: 4720, status: "AVAILABLE - 0003", avail: true }
            }
        },
        {
            number: "12952",
            name: "Mumbai Rajdhani",
            fromCode: "BCT",
            fromName: "Mumbai Central",
            toCode: "NDLS",
            toName: "New Delhi",
            depTime: "17:00",
            arrTime: "08:30",
            duration: "15h 30m",
            runsDays: "Daily",
            type: "Rajdhani Superfast",
            classes: {
                "3A": { name: "AC 3 Tier", fare: 1850, status: "AVAILABLE - 0082", avail: true },
                "2A": { name: "AC 2 Tier", fare: 2850, status: "AVAILABLE - 0019", avail: true },
                "1A": { name: "AC First Class", fare: 4850, status: "RAC 04", avail: true }
            }
        },
        {
            number: "12009",
            name: "Shatabdi Express",
            fromCode: "BCT",
            fromName: "Mumbai Central",
            toCode: "ADI",
            toName: "Ahmedabad Junction",
            depTime: "06:20",
            arrTime: "12:40",
            duration: "06h 20m",
            runsDays: "Mon, Tue, Wed, Thu, Fri, Sat",
            type: "Shatabdi",
            classes: {
                "CC": { name: "AC Chair Car", fare: 1040, status: "WL 12", avail: false },
                "EC": { name: "Exec. Chair Car", fare: 2150, status: "AVAILABLE - 0014", avail: true }
            }
        },
        {
            number: "12010",
            name: "Ahmedabad Shatabdi",
            fromCode: "ADI",
            fromName: "Ahmedabad Junction",
            toCode: "BCT",
            toName: "Mumbai Central",
            depTime: "14:40",
            arrTime: "21:20",
            duration: "06h 40m",
            runsDays: "Mon, Tue, Wed, Thu, Fri, Sat",
            type: "Shatabdi",
            classes: {
                "CC": { name: "AC Chair Car", fare: 1040, status: "AVAILABLE - 0056", avail: true },
                "EC": { name: "Exec. Chair Car", fare: 2150, status: "AVAILABLE - 0008", avail: true }
            }
        },
        {
            number: "22436",
            name: "Vande Bharat Express",
            fromCode: "NDLS",
            fromName: "New Delhi",
            toCode: "BSB",
            toName: "Varanasi Junction",
            depTime: "06:00",
            arrTime: "14:00",
            duration: "08h 00m",
            runsDays: "Tue, Wed, Fri, Sat, Sun",
            type: "Vande Bharat Semi-Highspeed",
            classes: {
                "CC": { name: "AC Chair Car", fare: 1750, status: "AVAILABLE - 0092", avail: true },
                "EC": { name: "Exec. Chair Car", fare: 3300, status: "AVAILABLE - 0016", avail: true }
            }
        },
        {
            number: "12302",
            name: "Howrah Rajdhani",
            fromCode: "NDLS",
            fromName: "New Delhi",
            toCode: "HWH",
            toName: "Howrah Junction",
            depTime: "16:55",
            arrTime: "09:55",
            duration: "17h 00m",
            runsDays: "Daily",
            type: "Rajdhani Superfast",
            classes: {
                "3A": { name: "AC 3 Tier", fare: 1940, status: "AVAILABLE - 0074", avail: true },
                "2A": { name: "AC 2 Tier", fare: 2980, status: "AVAILABLE - 0018", avail: true },
                "1A": { name: "AC First Class", fare: 5120, status: "AVAILABLE - 0004", avail: true }
            }
        },
        {
            number: "12626",
            name: "Kerala Express",
            fromCode: "NDLS",
            fromName: "New Delhi",
            toCode: "TVC",
            toName: "Thiruvananthapuram Central",
            depTime: "20:10",
            arrTime: "14:15",
            duration: "42h 05m",
            runsDays: "Daily",
            type: "Superfast Express",
            classes: {
                "SL": { name: "Sleeper", fare: 890, status: "AVAILABLE - 0120", avail: true },
                "3A": { name: "AC 3 Tier", fare: 2340, status: "AVAILABLE - 0042", avail: true },
                "2A": { name: "AC 2 Tier", fare: 3450, status: "WL 08", avail: false }
            }
        },
        {
            number: "12004",
            name: "Lucknow Swarna Shatabdi",
            fromCode: "NDLS",
            fromName: "New Delhi",
            toCode: "LKO",
            toName: "Lucknow Charbagh",
            depTime: "06:10",
            arrTime: "12:40",
            duration: "06h 30m",
            runsDays: "Daily",
            type: "Shatabdi",
            classes: {
                "CC": { name: "AC Chair Car", fare: 1165, status: "AVAILABLE - 0134", avail: true },
                "EC": { name: "Exec. Chair Car", fare: 2125, status: "AVAILABLE - 0022", avail: true }
            }
        },
        {
            number: "12903",
            name: "Golden Temple Mail",
            fromCode: "BCT",
            fromName: "Mumbai Central",
            toCode: "ASR",
            toName: "Amritsar Junction",
            depTime: "18:45",
            arrTime: "05:40",
            duration: "34h 55m",
            runsDays: "Daily",
            type: "Mail / Express",
            classes: {
                "SL": { name: "Sleeper", fare: 730, status: "AVAILABLE - 0210", avail: true },
                "3A": { name: "AC 3 Tier", fare: 1960, status: "AVAILABLE - 0035", avail: true },
                "2A": { name: "AC 2 Tier", fare: 2880, status: "WL 15", avail: false }
            }
        }
    ];

    // 3. User & Auth Initial State
    const DEFAULT_USER = {
        name: "RAJESH KUMAR",
        email: "rajesh.kumar@gmail.com",
        userId: "rajesh_k",
        phone: "+91 98765 43210",
        isLoggedIn: true
    };

    // 4. Default Master Passengers
    const DEFAULT_MASTER_LIST = [
        {
            id: "mp_1",
            name: "RAJESH KUMAR",
            age: 34,
            gender: "Male",
            idType: "Aadhar Card",
            idNumber: "XXXX-XXXX-4892",
            berthPreference: "Lower",
            status: "Verified"
        },
        {
            id: "mp_2",
            name: "ANITA KUMARI",
            age: 32,
            gender: "Female",
            idType: "PAN Card",
            idNumber: "ABCDE1234F",
            berthPreference: "No Preference",
            status: "Verified"
        },
        {
            id: "mp_3",
            name: "AARAV KUMAR",
            age: 8,
            gender: "Male",
            idType: "School ID / Birth Certificate",
            idNumber: "SCH-9920",
            berthPreference: "Upper",
            status: "Verified"
        }
    ];

    // 5. Default Bookings
    const DEFAULT_BOOKINGS = [
        {
            pnr: "8472910472",
            trainNumber: "12951",
            trainName: "Rajdhani Express",
            from: "New Delhi (NDLS)",
            fromCode: "NDLS",
            to: "Mumbai Central (BCT)",
            toCode: "BCT",
            depTime: "16:30",
            arrTime: "08:35",
            journeyDate: "2026-11-24",
            formattedDate: "24 Nov 2026",
            classCode: "2A",
            className: "AC 2 Tier",
            quota: "General",
            status: "Confirmed",
            coach: "B2",
            totalFare: 5970.80,
            bookingDate: "2026-09-15",
            passengers: [
                { name: "RAJESH KUMAR", age: 34, gender: "Male", berth: "21 (Lower)", status: "CNF" },
                { name: "ANITA KUMARI", age: 32, gender: "Female", berth: "22 (Upper)", status: "CNF" }
            ]
        },
        {
            pnr: "2938471625",
            trainNumber: "12009",
            trainName: "Shatabdi Express",
            from: "Mumbai Central (BCT)",
            fromCode: "BCT",
            to: "Ahmedabad Junction (ADI)",
            toCode: "ADI",
            depTime: "06:20",
            arrTime: "12:40",
            journeyDate: "2026-12-12",
            formattedDate: "12 Dec 2026",
            classCode: "CC",
            className: "AC Chair Car",
            quota: "General",
            status: "Waitlisted",
            wlDetails: "WL/12",
            coach: "WL",
            totalFare: 1075.40,
            bookingDate: "2026-09-10",
            passengers: [
                { name: "RAJESH KUMAR", age: 34, gender: "Male", berth: "WL 12", status: "WL/12" }
            ]
        }
    ];

    // 6. Default Loyalty State
    const DEFAULT_LOYALTY = {
        cardNumber: "SBI Railway Platinum **** 4012",
        points: 12450,
        expiry: "12/29",
        activities: [
            { title: "Ticket Booking - Rajdhani (12951)", date: "12 Nov 2026", points: 340, type: "credit" },
            { title: "E-Catering Order - Haldirams Deluxe Thali", date: "02 Oct 2026", points: 50, type: "credit" },
            { title: "Welcome Reward Bonus", date: "15 Aug 2026", points: 1000, type: "credit" }
        ]
    };

    // 7. Default E-Wallet State
    const DEFAULT_WALLET = {
        balance: 4500.00,
        transactions: [
            { id: "TXN9921", date: "16-Sep-2026", desc: "Top up via UPI", amount: 2000.00, type: "credit" },
            { id: "TXN8812", date: "12-Sep-2026", desc: "Ticket PNR 8472910472 Payment", amount: -3135.40, type: "debit" },
            { id: "TXN7701", date: "01-Sep-2026", desc: "Refund PNR 1102948201", amount: 1850.00, type: "credit" }
        ]
    };

    // Initialization Helper
    function initStorage() {
        if (!localStorage.getItem("irctc_user")) {
            localStorage.setItem("irctc_user", JSON.stringify(DEFAULT_USER));
        }
        if (!localStorage.getItem("irctc_master_list")) {
            localStorage.setItem("irctc_master_list", JSON.stringify(DEFAULT_MASTER_LIST));
        }
        if (!localStorage.getItem("irctc_bookings")) {
            localStorage.setItem("irctc_bookings", JSON.stringify(DEFAULT_BOOKINGS));
        }
        if (!localStorage.getItem("irctc_loyalty")) {
            localStorage.setItem("irctc_loyalty", JSON.stringify(DEFAULT_LOYALTY));
        }
        if (!localStorage.getItem("irctc_wallet")) {
            localStorage.setItem("irctc_wallet", JSON.stringify(DEFAULT_WALLET));
        }
    }

    // Auth API
    function getUser() {
        return JSON.parse(localStorage.getItem("irctc_user")) || DEFAULT_USER;
    }

    function setUser(user) {
        localStorage.setItem("irctc_user", JSON.stringify(user));
        updateHeaderUser();
    }

    function logout() {
        const u = getUser();
        u.isLoggedIn = false;
        localStorage.setItem("irctc_user", JSON.stringify(u));
        showToast("Logged out successfully", "info");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 400);
    }

    function login(userId, pass) {
        const u = getUser();
        u.isLoggedIn = true;
        if (userId) u.userId = userId;
        localStorage.setItem("irctc_user", JSON.stringify(u));
        showToast("Welcome back, " + u.name + "!", "success");
        setTimeout(() => {
            window.location.href = "profile.html";
        }, 500);
    }

    // Master List API
    function getMasterList() {
        return JSON.parse(localStorage.getItem("irctc_master_list")) || [];
    }

    function saveMasterPassenger(passenger) {
        const list = getMasterList();
        if (passenger.id) {
            const index = list.findIndex(p => p.id === passenger.id);
            if (index !== -1) {
                list[index] = passenger;
            } else {
                list.push(passenger);
            }
        } else {
            passenger.id = "mp_" + Date.now();
            passenger.status = "Verified";
            list.push(passenger);
        }
        localStorage.setItem("irctc_master_list", JSON.stringify(list));
        return list;
    }

    function deleteMasterPassenger(id) {
        let list = getMasterList();
        list = list.filter(p => p.id !== id);
        localStorage.setItem("irctc_master_list", JSON.stringify(list));
        return list;
    }

    // Bookings API
    function getBookings() {
        return JSON.parse(localStorage.getItem("irctc_bookings")) || [];
    }

    function getBookingByPnr(pnr) {
        const list = getBookings();
        return list.find(b => String(b.pnr).trim() === String(pnr).trim());
    }

    function createBooking(bookingData) {
        const list = getBookings();
        // Generate real 10 digit PNR
        const pnr = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        bookingData.pnr = pnr;
        bookingData.bookingDate = new Date().toISOString().split("T")[0];
        
        list.unshift(bookingData);
        localStorage.setItem("irctc_bookings", JSON.stringify(list));

        // Credit Loyalty Points (10% of total fare as points)
        const pointsEarned = Math.round(bookingData.totalFare * 0.1);
        creditLoyaltyPoints("Booking PNR: " + pnr, pointsEarned);

        return bookingData;
    }

    function cancelBooking(pnr) {
        const list = getBookings();
        const booking = list.find(b => String(b.pnr).trim() === String(pnr).trim());
        if (!booking) return false;

        booking.status = "Cancelled";
        booking.passengers.forEach(p => p.status = "CAN");
        
        // Cancellation refund (deduct ₹120 clerkage fee per passenger)
        const clerkage = 120 * booking.passengers.length;
        const refundAmt = Math.max(0, booking.totalFare - clerkage);
        booking.refundAmount = refundAmt;

        localStorage.setItem("irctc_bookings", JSON.stringify(list));

        // Credit refund to wallet
        creditWallet(refundAmt, `Refund for PNR ${pnr} (Deducted ₹${clerkage} clerkage)`);

        return { booking, refundAmt, clerkage };
    }

    // Loyalty API
    function getLoyalty() {
        return JSON.parse(localStorage.getItem("irctc_loyalty")) || DEFAULT_LOYALTY;
    }

    function creditLoyaltyPoints(title, points) {
        const loy = getLoyalty();
        loy.points += points;
        loy.activities.unshift({
            title,
            date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            points,
            type: "credit"
        });
        localStorage.setItem("irctc_loyalty", JSON.stringify(loy));
    }

    function redeemLoyaltyPoints(points) {
        const loy = getLoyalty();
        if (loy.points < points) return false;
        loy.points -= points;
        const cashValue = (points * 0.25); // 4 points = ₹1
        loy.activities.unshift({
            title: `Points Redeemed (₹${cashValue.toFixed(2)} to E-Wallet)`,
            date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            points: -points,
            type: "debit"
        });
        localStorage.setItem("irctc_loyalty", JSON.stringify(loy));
        creditWallet(cashValue, "Redeemed Loyalty Points");
        return cashValue;
    }

    // Wallet API
    function getWallet() {
        return JSON.parse(localStorage.getItem("irctc_wallet")) || DEFAULT_WALLET;
    }

    function creditWallet(amt, desc) {
        const w = getWallet();
        w.balance += parseFloat(amt);
        w.transactions.unshift({
            id: "TXN" + Math.floor(1000 + Math.random() * 9000),
            date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            desc: desc || "Wallet Credit",
            amount: parseFloat(amt),
            type: "credit"
        });
        localStorage.setItem("irctc_wallet", JSON.stringify(w));
    }

    function debitWallet(amt, desc) {
        const w = getWallet();
        if (w.balance < amt) return false;
        w.balance -= parseFloat(amt);
        w.transactions.unshift({
            id: "TXN" + Math.floor(1000 + Math.random() * 9000),
            date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            desc: desc || "Wallet Debit",
            amount: -parseFloat(amt),
            type: "debit"
        });
        localStorage.setItem("irctc_wallet", JSON.stringify(w));
        return true;
    }

    // Station Autocomplete
    function setupStationAutocomplete(inputElement) {
        if (!inputElement) return;

        // Container wrapper
        inputElement.parentElement.style.position = "relative";
        
        let list = inputElement.parentElement.querySelector(".autocomplete-suggestions");
        if (!list) {
            list = document.createElement("ul");
            list.className = "autocomplete-suggestions";
            inputElement.parentElement.appendChild(list);
        }

        inputElement.addEventListener("input", function() {
            const query = this.value.trim().toLowerCase();
            if (query.length === 0) {
                list.style.display = "none";
                return;
            }

            const matches = STATIONS.filter(s => 
                s.name.toLowerCase().includes(query) || 
                s.code.toLowerCase().includes(query) ||
                s.state.toLowerCase().includes(query)
            );

            if (matches.length === 0) {
                list.style.display = "none";
                return;
            }

            list.innerHTML = "";
            matches.slice(0, 8).forEach(item => {
                const li = document.createElement("li");
                li.innerHTML = `<strong>${item.name} (${item.code})</strong> <span>${item.state}</span>`;
                li.addEventListener("mousedown", (e) => {
                    e.preventDefault();
                    inputElement.value = `${item.name} (${item.code})`;
                    list.style.display = "none";
                });
                list.appendChild(li);
            });
            list.style.display = "block";
        });

        inputElement.addEventListener("blur", () => {
            setTimeout(() => { list.style.display = "none"; }, 200);
        });

        inputElement.addEventListener("focus", function() {
            if (this.value.trim().length > 0) {
                inputElement.dispatchEvent(new Event("input"));
            }
        });
    }

    // Live Clock & Header Setup
    function initLiveClock() {
        function update() {
            const now = new Date();
            const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
            const timeStr = now.toTimeString().split(" ")[0];
            const clockEl = document.getElementById("live-clock");
            if (clockEl) {
                clockEl.textContent = `${dateStr} [${timeStr}]`;
            }
        }
        update();
        setInterval(update, 1000);
    }

    function initFontSizeControl() {
        const saved = localStorage.getItem("irctc_font_size") || "14px";
        document.documentElement.style.setProperty("--font-size-base", saved);
    }

    function setFontSize(size) {
        document.documentElement.style.setProperty("--font-size-base", size);
        localStorage.setItem("irctc_font_size", size);
    }

    function updateHeaderUser() {
        const user = getUser();
        const userContainer = document.getElementById("header-user-slot");
        if (!userContainer) return;

        if (user && user.isLoggedIn) {
            userContainer.innerHTML = `
                <div class="user-badge-header">
                    <span class="user-badge-name">Welcome, ${user.name}</span>
                    <button class="btn-logout" onclick="IRCTC.logout()">Logout</button>
                </div>
            `;
        } else {
            userContainer.innerHTML = `
                <button class="btn-login" onclick="window.location.href='login.html'">Login</button>
            `;
        }
    }

    // Toast Generator
    function showToast(message, type = "info") {
        let container = document.getElementById("toast-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "toast-container";
            document.body.appendChild(container);
        }

        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        
        let icon = "ℹ️";
        if (type === "success") icon = "✓";
        if (type === "error") icon = "✕";

        toast.innerHTML = `<span style="font-weight:bold; font-size:16px;">${icon}</span> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(50px)";
            toast.style.transition = "all 0.3s ease";
            setTimeout(() => toast.remove(), 300);
        }, 3600);
    }

    // Modal Utilities
    function openModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add("open");
            document.body.style.overflow = "hidden";
        }
    }

    function closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove("open");
            document.body.style.overflow = "";
        }
    }

    // Printable Electronic Reservation Slip (ERS) generator
    function showPrintTicketModal(pnr) {
        const b = getBookingByPnr(pnr);
        if (!b) {
            showToast("PNR not found", "error");
            return;
        }

        let modal = document.getElementById("ticket-print-modal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "ticket-print-modal";
            modal.className = "modal-overlay";
            modal.innerHTML = `
                <div class="modal-box wide">
                    <div class="modal-header">
                        <div class="modal-title">ELECTRONIC RESERVATION SLIP (ERS)</div>
                        <button class="modal-close" onclick="IRCTC.closeModal('ticket-print-modal')">×</button>
                    </div>
                    <div class="modal-body" id="ticket-modal-content"></div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="IRCTC.closeModal('ticket-print-modal')">Close</button>
                        <button class="btn-primary" onclick="window.print()">🖨️ Print Ticket</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        const content = document.getElementById("ticket-modal-content");
        content.innerHTML = `
            <div style="border: 2px solid var(--ink); padding: 24px; background: white; font-family: var(--font-grotesque);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--ink); padding-bottom: 12px; margin-bottom: 16px;">
                    <div>
                        <div style="font-family: var(--font-script); font-size: 36px; font-weight: bold; line-height: 1;">INDIAN RAILWAYS</div>
                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink-muted);">Indian Railway Catering & Tourism Corporation Ltd.</div>
                    </div>
                    <div style="text-align: right;">
                        <span class="status-badge ${b.status === 'Confirmed' ? 'confirmed' : (b.status === 'Cancelled' ? 'cancelled' : 'waitlist')}" style="font-size: 13px; padding: 6px 14px;">${b.status}</span>
                        <div style="font-family: monospace; font-size: 12px; margin-top: 4px;">Booked on: ${b.bookingDate || '16-Sep-2026'}</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; background: var(--paper); padding: 16px; border: 1px solid var(--line-strong); margin-bottom: 16px;">
                    <div>
                        <div style="font-size: 11px; text-transform: uppercase; color: var(--ink-muted);">PNR Number</div>
                        <div style="font-family: var(--font-script); font-size: 28px; color: var(--ink); letter-spacing: 0.05em;">${b.pnr}</div>
                        <div style="margin-top: 8px; font-size: 16px; font-weight: 700;">${b.trainName} (${b.trainNumber})</div>
                        <div style="font-size: 13px; color: var(--ink-muted);">${b.from} → ${b.to}</div>
                    </div>
                    <div style="border-left: 1px solid var(--line-strong); padding-left: 16px; font-size: 13px; line-height: 1.8;">
                        <div><strong>Date:</strong> ${b.formattedDate || b.journeyDate}</div>
                        <div><strong>Class:</strong> ${b.classCode} (${b.className})</div>
                        <div><strong>Quota:</strong> ${b.quota || 'General'}</div>
                        <div><strong>Coach:</strong> ${b.coach || 'B2'}</div>
                    </div>
                </div>

                <h4 style="text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; margin-bottom: 8px;">Passenger Details</h4>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px;">
                    <thead>
                        <tr style="background: var(--paper); border-bottom: 1px solid var(--line-strong); text-align: left;">
                            <th style="padding: 8px;">#</th>
                            <th style="padding: 8px;">Passenger Name</th>
                            <th style="padding: 8px;">Age / Gender</th>
                            <th style="padding: 8px;">Booking Status</th>
                            <th style="padding: 8px;">Current Status / Coach-Berth</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${b.passengers.map((p, idx) => `
                            <tr style="border-bottom: 1px solid var(--line);">
                                <td style="padding: 8px;">${idx + 1}</td>
                                <td style="padding: 8px; font-weight: 600;">${p.name}</td>
                                <td style="padding: 8px;">${p.age} / ${p.gender}</td>
                                <td style="padding: 8px;"><span style="color:var(--accent-sage); font-weight:600;">${p.status || 'CNF'}</span></td>
                                <td style="padding: 8px; font-weight: bold;">${p.berth || (b.coach ? b.coach + ' / ' + (20 + idx) : 'WL')}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>

                <div style="display: flex; justify-content: space-between; background: var(--paper); padding: 12px 16px; border: 1px solid var(--line-strong); font-size: 13px;">
                    <span><strong>Total Fare Paid:</strong> ₹ ${parseFloat(b.totalFare).toFixed(2)}</span>
                    <span><strong>Payment Mode:</strong> IRCTC Gateway / Verified</span>
                </div>

                <div style="margin-top: 16px; font-size: 11px; color: var(--ink-muted); line-height: 1.5; border-top: 1px solid var(--line); padding-top: 8px;">
                    * Valid photo ID proof (Aadhaar, Passport, Driving License, PAN card) must be carried during the journey in original.
                    * This computer-generated ERS does not require a physical signature.
                </div>
            </div>
        `;

        openModal("ticket-print-modal");
    }

    // Global Initializer on DOM Ready
    document.addEventListener("DOMContentLoaded", () => {
        initStorage();
        initLiveClock();
        initFontSizeControl();
        updateHeaderUser();

        // Autocomplete all station inputs
        document.querySelectorAll('input[data-station-search="true"]').forEach(input => {
            setupStationAutocomplete(input);
        });

        // Close modal on clicking overlay backdrop
        document.querySelectorAll(".modal-overlay").forEach(overlay => {
            overlay.addEventListener("click", (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove("open");
                    document.body.style.overflow = "";
                }
            });
        });
    });

    return {
        STATIONS,
        TRAINS,
        getUser,
        setUser,
        login,
        logout,
        getMasterList,
        saveMasterPassenger,
        deleteMasterPassenger,
        getBookings,
        getBookingByPnr,
        createBooking,
        cancelBooking,
        getLoyalty,
        creditLoyaltyPoints,
        redeemLoyaltyPoints,
        getWallet,
        creditWallet,
        debitWallet,
        setupStationAutocomplete,
        showToast,
        openModal,
        closeModal,
        setFontSize,
        showPrintTicketModal
    };
})();
