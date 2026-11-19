# Profile & Progress UI - Visual Layout

## ProfileScreen Layout

```
┌─────────────────────────────────────────┐
│         PROFILE HEADER (Blue)           │
│                                         │
│              ┌─────┐                    │
│              │  J  │  (Avatar)          │
│              └─────┘                    │
│            John Doe                     │
│         john@example.com                │
│     Member since Jan 1, 2024            │
│                                         │
└─────────────────────────────────────────┘

┌──────────┬──────────┬──────────┬──────────┐
│   85%    │   12h    │   5/11   │    7     │
│ Overall  │ Practice │ Lessons  │   Day    │
│  Score   │   Time   │          │  Streak  │
└──────────┴──────────┴──────────┴──────────┘

┌─────────────────────────────────────────┐
│  Achievements                           │
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │    🎯    │  │    🔥    │            │
│  │First Steps│  │ Dedicated│            │
│  │10 exercises│  │50 exercises│          │
│  └──────────┘  └──────────┘            │
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │    🏆    │  │    📅    │            │
│  │Excellence│  │ 3-Day    │            │
│  │ 90%+ score│  │  Streak  │            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Detailed Stats                         │
│                                         │
│  Total Exercises          125           │
│  ─────────────────────────────────      │
│  Best Score               95%           │
│  ─────────────────────────────────      │
│  Average Score            85%           │
│  ─────────────────────────────────      │
│  Completed Lessons        5             │
│                                         │
│  Phonemes to Practice                   │
│  TH                       12 errors     │
│  V                        8 errors      │
│  R                        6 errors      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Quick Actions                          │
│                                         │
│  📊  View Progress                  ›   │
│      See detailed learning journey      │
│                                         │
│  🎯  Continue Learning              ›   │
│      Practice more exercises            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Settings                               │
│                                         │
│  🚪  Sign Out                           │
└─────────────────────────────────────────┘
```

## ProgressScreen Layout

```
┌─────────────────────────────────────────┐
│      PROGRESS HEADER (Blue)             │
│                                         │
│         Your Progress                   │
│    Track your learning journey          │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Weekly Progress                        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     █                           │   │
│  │     █     █                     │   │
│  │     █     █     █               │   │
│  │ █   █     █     █     █     █   │   │
│  │ █   █     █     █     █     █   │   │
│  │ Mon Tue Wed Thu Fri Sat Sun     │   │
│  │  5   8    6    7    4    3      │   │
│  └─────────────────────────────────┘   │
│  (Green bars = 80%+, Orange = 60-79%)  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Lesson Performance                     │
│                                         │
│  Short Vowels              92%          │
│  ████████████████████░░░░               │
│  25 exercises completed                 │
│                                         │
│  Long Vowels               88%          │
│  ██████████████████░░░░░░               │
│  20 exercises completed                 │
│                                         │
│  TH Sound                  75%          │
│  ███████████████░░░░░░░░░               │
│  18 exercises completed                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Phonemes to Practice                   │
│                                         │
│  TH                       12 errors     │
│  V                        8 errors      │
│  R                        6 errors      │
│  W                        5 errors      │
│  L                        4 errors      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Recent Activity                        │
│                                         │
│  hot                      95%           │
│  Jan 15, 2024 10:30 AM                  │
│                                         │
│  think                    88%           │
│  Jan 15, 2024 10:25 AM                  │
│  Errors: TH                             │
│                                         │
│  very                     92%           │
│  Jan 15, 2024 10:20 AM                  │
└─────────────────────────────────────────┘
```

## Color Legend

### Score Colors
- **Green (#4caf50)**: 90-100% (Excellent)
- **Light Green (#8bc34a)**: 80-89% (Good)
- **Orange (#ff9800)**: 70-79% (Fair)
- **Red (#f44336)**: Below 70% (Needs Practice)

### UI Colors
- **Primary Blue (#2196F3)**: Headers, buttons, highlights
- **White (#fff)**: Card backgrounds
- **Light Gray (#f5f5f5)**: Screen background
- **Dark Gray (#333)**: Primary text
- **Medium Gray (#666)**: Secondary text
- **Light Gray (#999)**: Tertiary text

## Responsive Behavior

### Stats Grid (4 columns)
- Desktop/Tablet: 4 columns side-by-side
- Mobile: 2x2 grid

### Achievement Badges
- Desktop: 4 per row
- Mobile: 2 per row

### Charts
- Scales to screen width
- Maintains aspect ratio
- Touch-friendly on mobile

## Interaction States

### Buttons/Cards
- Default: White background, subtle shadow
- Pressed: Slight opacity change (0.7)
- Disabled: Gray background, reduced opacity

### Navigation
- Tap card → Navigate to screen
- Swipe → Scroll content
- Pull down → Refresh (future enhancement)

## Empty States

### No Data Yet
```
┌─────────────────────────────────────────┐
│                                         │
│         No practice history yet         │
│    Start practicing to see progress!    │
│                                         │
│        ┌──────────────────┐             │
│        │  Start Learning  │             │
│        └──────────────────┘             │
│                                         │
└─────────────────────────────────────────┘
```

## Loading States

### Initial Load
```
┌─────────────────────────────────────────┐
│                                         │
│              ⟳ Loading...               │
│                                         │
└─────────────────────────────────────────┘
```

## Accessibility Features

- Large touch targets (minimum 44x44 points)
- High contrast text
- Clear visual hierarchy
- Readable font sizes
- Color + text indicators (not color alone)
- Proper spacing for readability

## Animation Notes (Future)

Potential animations to add:
- Fade in cards on load
- Slide up from bottom
- Progress bar fill animation
- Badge unlock celebration
- Number count-up effect
- Chart bars grow from bottom

## Platform Differences

### iOS
- Native feel with system fonts
- Smooth scrolling
- Haptic feedback on actions

### Android
- Material Design elevation
- Ripple effects on touch
- System back button support

### Web
- Hover states on cards
- Cursor pointer on clickable items
- Keyboard navigation support
