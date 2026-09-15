# CAR PHYSICS SETUP - COMPLETE REFERENCE GUIDE

## **CRITICAL FIXES APPLIED**

### 1. **Wheel Size Scaling (MOST IMPORTANT!)**
- **Reference car**: 50px wheel radius
- **Your car**: 15px wheel radius  
- **Ratio**: 50 ÷ 15 = **3.33×**

**Why this matters:** Linear speed = angular velocity × radius
- Same angular velocity on smaller wheel = slower movement
- **Solution**: Multiply all speed values by 3.33

```javascript
// Reference car (50px wheels):
MAX_SPEED: 0.75
ACCELERATION: 0.0058

// Your car (15px wheels) - SCALED UP:
MAX_SPEED: 2.5              // 0.75 × 3.33
ACCELERATION: 0.019         // 0.0058 × 3.33
```

### 2. **Ground Friction**
- **Was**: 1.0 (too high, wheels slip)
- **Now**: 0.8 (matches successful example)
- **Formula**: Effective friction = wheel_friction × ground_friction
  - Your setup: 0.9 × 0.8 = **0.72** (good traction)

### 3. **Constraint Setup**
```javascript
length: 0,          // Rigid constraint (not a spring!)
stiffness: 0.2      // Slight compliance for suspension feel
// NO damping parameter in successful example
```

---

## **COMPLETE CAR CONFIGURATION**

### **Body Dimensions**
```javascript
CHASSIS_WIDTH: 120          // Your small sedan
CHASSIS_HEIGHT: 60
WHEEL_RADIUS: 15            // Small wheels (not 50px tractor wheels)

// Wheel positions relative to chassis center:
REAR_WHEEL_OFFSET_X: -38    // Behind center
REAR_WHEEL_OFFSET_Y: 25     // Below center
FRONT_WHEEL_OFFSET_X: 38    // Front of center
FRONT_WHEEL_OFFSET_Y: 25    // Below center
```

### **Physics Properties**

**Densities:**
```javascript
CHASSIS_DENSITY: 0.002      // Body is heavier
WHEEL_DENSITY: 0.001        // Wheels are lighter
```

**Friction Values:**
```javascript
WHEEL_FRICTION: 0.9         // HIGH - for traction
GROUND_FRICTION: 0.8        // Medium-high
// Combined: 0.9 × 0.8 = 0.72 effective friction
```

**Restitution (Bounciness):**
```javascript
// All set to 0 - NO BOUNCING
wheelRestitution: 0
groundRestitution: 0
```

**Motor Control (SCALED FOR 15px WHEELS):**
```javascript
MAX_SPEED: 2.5              // Angular velocity (rad/frame)
MAX_SPEED_BACKWARDS: 1.875  // 75% of forward
ACCELERATION: 0.019         // Ramp-up rate per frame
ACCELERATION_BACKWARDS: 0.014
```

### **Constraint (Axle) Settings**
```javascript
length: 0                   // Zero = rigid constraint
stiffness: 0.2             // Low stiffness = soft suspension
pointA: { x: wheelOffsetX, y: wheelOffsetY }  // On chassis
pointB: { x: 0, y: 0 }     // Center of wheel
```

---

## **COLLISION GROUP SETUP (CRITICAL!)**

```javascript
// Create negative collision group for car parts
const vehicleGroup = scene.matter.world.nextGroup(true)  // true = negative

// Apply to ALL car parts:
chassis: {
  collisionFilter: { group: vehicleGroup }
}
rearWheel: {
  collisionFilter: { group: vehicleGroup }
}
frontWheel: {
  collisionFilter: { group: vehicleGroup }
}
```

**How it works:**
- Negative group → car parts **ignore each other**
- Still collide with ground (ground has no group)
- Prevents wheel-chassis collision that breaks car

**Ground bodies:**
```javascript
// NO collision filter needed - default collides with everything
{
  isStatic: true,
  friction: 0.8,
  restitution: 0
}
```

---

## **MOTOR APPLICATION (Both Wheels Driven - AWD)**

```javascript
applyMotorPower() {
    const rearWheel = this.vehicle.rearWheel
    const frontWheel = this.vehicle.frontWheel
    
    if (isAccelerating) {
        // Gradual acceleration
        let newSpeed = rearWheel.angularSpeed <= 0 
            ? MAX_SPEED / 10           // Kickstart from zero
            : rearWheel.angularSpeed + ACCELERATION
        if (newSpeed > MAX_SPEED) newSpeed = MAX_SPEED
        
        // Apply to BOTH wheels (AWD)
        this.matter.body.setAngularVelocity(rearWheel, newSpeed)
        this.matter.body.setAngularVelocity(frontWheel, newSpeed)
    }
}
```

**Key points:**
- Direct angular velocity control (not torque)
- Both wheels powered equally
- Gradual ramp-up via ACCELERATION
- Initial boost: MAX_SPEED / 10 when starting

---

## **WHEEL SIZE SCALING FORMULA**

**If you change wheel size, use this:**

```javascript
// 1. Calculate ratio
const REFERENCE_WHEEL_SIZE = 50  // Successful example
const YOUR_WHEEL_SIZE = 15       // Your car
const RATIO = REFERENCE_WHEEL_SIZE / YOUR_WHEEL_SIZE  // 3.33

// 2. Scale speeds
const MAX_SPEED = 0.75 * RATIO           // 2.5
const ACCELERATION = (0.75 / 130) * RATIO // 0.019

// 3. Scale backwards values (75% of forward)
const MAX_SPEED_BACKWARDS = MAX_SPEED * 0.75
const ACCELERATION_BACKWARDS = ACCELERATION * 0.75
```

**Why?** Smaller wheels rotate faster to achieve same ground speed:
- 50px wheel at 0.75 rad/frame = 37.5 px/frame linear
- 15px wheel at 2.5 rad/frame = 37.5 px/frame linear (same!)

---

## **COMPLETE SETUP CHECKLIST**

### ✅ **Step 1: Create Collision Group**
```javascript
const vehicleGroup = scene.matter.world.nextGroup(true)
```

### ✅ **Step 2: Create Chassis**
```javascript
chassis: this.matter.add.rectangle(x, y, 120, 60, {
    density: 0.002,
    chamfer: { radius: 30 },  // Round corners (height * 0.5)
    collisionFilter: { group: vehicleGroup }
})
```

### ✅ **Step 3: Create Wheels**
```javascript
rearWheel: this.matter.add.circle(x - 38, y + 25, 15, {
    density: 0.001,
    friction: 0.9,
    restitution: 0,
    collisionFilter: { group: vehicleGroup }
})

frontWheel: this.matter.add.circle(x + 38, y + 25, 15, {
    density: 0.001,
    friction: 0.9,
    restitution: 0,
    collisionFilter: { group: vehicleGroup }
})
```

### ✅ **Step 4: Add Axle Constraints**
```javascript
// Rear axle
scene.matter.add.constraint(chassis, rearWheel, 0, 0.2, {
    pointA: { x: -38, y: 25 }  // Wheel offset on chassis
})

// Front axle  
scene.matter.add.constraint(chassis, frontWheel, 0, 0.2, {
    pointA: { x: 38, y: 25 }
})
```

### ✅ **Step 5: Create Ground**
```javascript
ground: this.matter.add.rectangle(x, y, width, height, {
    isStatic: true,
    friction: 0.8,
    restitution: 0
})
```

### ✅ **Step 6: Apply Motor (in update loop)**
```javascript
// Calculate new speed with gradual ramp
let newSpeed = wheel.angularSpeed + ACCELERATION
if (newSpeed > MAX_SPEED) newSpeed = MAX_SPEED

// Apply to both wheels
this.matter.body.setAngularVelocity(rearWheel, newSpeed)
this.matter.body.setAngularVelocity(frontWheel, newSpeed)
```

---

## **WHAT THIS CREATES**

**Physics Approach:**
- ✅ Real rigid body dynamics (Matter.js solver)
- ✅ Real collision detection
- ✅ Real wheel rotation drives car (friction-based)
- ✅ Soft suspension (from constraint stiffness)
- ❌ No torque calculation (direct angular velocity)
- ❌ No engine simulation (simplification)
- ❌ No differential (both wheels same speed)

**Result:** Smooth, stable, fun 2D car with realistic *feel* without complex simulation

---

## **QUICK COPY VALUES (15px Wheels)**

```javascript
// Car Dimensions
chassisWidth: 120
chassisHeight: 60
wheelRadius: 15
rearWheelX: -38
frontWheelX: 38
wheelY: 25

// Physics
chassisDensity: 0.002
wheelDensity: 0.001
wheelFriction: 0.9
groundFriction: 0.8

// Motor
maxSpeed: 2.5
maxSpeedBackwards: 1.875
acceleration: 0.019
accelerationBackwards: 0.014

// Constraint
axleLength: 0
axleStiffness: 0.2

// Chamfer
chassisChamfer: 30  // height * 0.5
```

---

## **COMMON MISTAKES TO AVOID**

❌ **Using mass instead of density** - Density scales with size automatically  
❌ **Forgetting collision group** - Wheels will hit chassis!  
❌ **Not scaling speed for wheel size** - Small wheels = no movement  
❌ **Ground friction = 1** - Too "sticky", causes weird physics  
❌ **Adding damping to constraint** - Makes axle mushy  
❌ **Driving only rear wheel** - Less stable, worse climbing  
❌ **Using spring length > 0** - Creates bouncy suspension (not rigid)  

---

## **TESTING YOUR SETUP**

1. **Car should spawn and drop onto ground smoothly**
2. **Pressing gas should make car accelerate gradually**
3. **Car should NOT bounce on flat ground** (rigid constraint)
4. **Wheels should rotate smoothly** (check angularVelocity in debug)
5. **Car should climb small slopes easily** (friction + AWD)
6. **Car parts should never collide with each other** (collision group)

**Debug values to check:**
```javascript
console.log('Rear wheel speed:', rearWheel.angularSpeed)  // Should reach ~2.5
console.log('Chassis velocity:', chassis.velocity)        // Should be positive when moving
console.log('Ground friction:', ground.friction)          // Should be 0.8
```

---

**This setup is proven to work for small sedan with 15px wheels!**
