# 🎨 UI Styling Guide & Troubleshooting Checklist

> **📋 Source-of-Truth**: This guide implements README.md's UI/UX Development Guidelines. All UI changes must follow both documents and reference README "Planned Changes" items.

## ⚠️ CRITICAL: Required Process for UI Changes

**From README.md - MUST follow this 5-step process:**
1. **Read this guide** - Complete the pre-change checklist below
2. **Run Pre-Change Checklist** - Verify text display, layout, responsive behavior
3. **Test Content Variations** - Short/long usernames, names, extreme content
4. **Verify Responsive Design** - Mobile (320px), tablet (768px), desktop (1024px+)
5. **Document Changes** - Use provided template in this guide

## 📋 Pre-Change Checklist

Before making ANY styling changes, verify these elements work correctly:

### ✅ Text Display & Truncation
- [ ] **Usernames** display fully or truncate gracefully with ellipsis
- [ ] **Full names** don't overflow containers
- [ ] **Long text** uses `truncate` class where appropriate
- [ ] **Multi-line text** has proper line-height and spacing

### ✅ Layout & Spacing
- [ ] **Flex containers** have proper `gap` or `space-x/y` classes
- [ ] **Grid layouts** maintain consistent column widths
- [ ] **Padding/margins** are consistent across similar elements
- [ ] **Container widths** accommodate content without overflow

### ✅ Responsive Behavior
- [ ] **Mobile view** (320px+) - All content visible
- [ ] **Tablet view** (768px+) - Proper grid/flex behavior
- [ ] **Desktop view** (1024px+) - Optimal spacing and layout
- [ ] **Large screens** (1440px+) - Content doesn't stretch awkwardly

### ✅ Interactive Elements
- [ ] **Hover effects** work on all interactive elements
- [ ] **Focus states** are visible for accessibility
- [ ] **Click targets** are minimum 44px for touch devices
- [ ] **Loading states** display properly

### ✅ Component-Specific Checks

#### InfluencerCard
- [ ] **Profile image** displays correctly or shows gradient fallback
- [ ] **Username** (@username) is visible and properly formatted
- [ ] **Full name** displays without cutting off
- [ ] **Follower tier badge** (Macro/Micro/etc.) is fully visible
- [ ] **Stats numbers** (followers, following, likes) are readable
- [ ] **Action buttons** (TikTok, Email) are accessible
- [ ] **Niche tags** don't overflow
- [ ] **Last updated** timestamp is visible

#### Dashboard
- [ ] **Stats cards** maintain consistent height and spacing
- [ ] **Search bar** is properly sized and functional
- [ ] **Filter dropdowns** don't overlap other elements
- [ ] **Grid layout** adapts to screen size
- [ ] **Loading skeletons** match actual card dimensions

#### Modal
- [ ] **Modal content** fits within viewport
- [ ] **Close button** is always accessible
- [ ] **Stats display** is properly formatted
- [ ] **Scroll behavior** works if content is long

## 🔧 Common Flexbox Patterns

### Container Layouts
```css
/* Full width with proper spacing */
.flex.items-center.justify-between.gap-3

/* Content that can shrink with fixed sidebar */
.flex.items-center.space-x-4.min-w-0.flex-1

/* Prevent shrinking for important elements */
.flex-shrink-0

/* Allow text truncation */
.min-w-0.flex-1
```

### Text Handling
```css
/* Truncate long text with ellipsis */
.truncate

/* Prevent text wrapping */
.whitespace-nowrap

/* Allow text to wrap naturally */
.whitespace-normal

/* Hide overflow without ellipsis */
.overflow-hidden
```

## 🚨 Red Flags to Watch For

### Layout Issues
- ❌ Using `justify-between` without proper `gap` or `space-x`
- ❌ Missing `min-w-0` on flex containers with text
- ❌ Using `flex-shrink-0` on containers that should shrink
- ❌ Forgetting `truncate` on long text elements

### Responsive Issues
- ❌ Fixed widths that don't adapt to screen size
- ❌ Missing responsive prefixes (`sm:`, `md:`, `lg:`)
- ❌ Assuming desktop-first design without mobile testing

### Accessibility Issues
- ❌ Click targets smaller than 44px
- ❌ Missing focus states
- ❌ Poor color contrast
- ❌ Missing alt text or aria labels

## 🧪 Testing Procedure

### 1. Visual Regression Check
Before and after each change:
1. Take screenshot of component in normal state
2. Test with long usernames/names
3. Test with short usernames/names
4. Test with missing data (null/undefined values)
5. Test hover states
6. Test on different screen sizes

### 2. Content Stress Testing
Test with extreme content:
- **Very long username**: `@verylongusernamethatmightoverflow`
- **Very long full name**: `This Is A Very Long Full Name That Might Cause Issues`
- **Large numbers**: `999,999,999` followers
- **Missing data**: `null`, `undefined`, empty strings
- **Special characters**: Emojis, unicode, symbols

### 3. Device Testing
- **Mobile**: iPhone SE (375px width)
- **Tablet**: iPad (768px width)  
- **Desktop**: Standard laptop (1024px width)
- **Large**: 4K monitor (1440px+ width)

## 📝 Change Documentation Template

When making styling changes, document:

```markdown
## Change: [Brief description]

### README Reference:
- Implements: README.md#planned-changes - [specific item]

### Problem:
- [What was broken/suboptimal]

### Solution:
- [What classes/styles were changed]

### Tested:
- [ ] Username display
- [ ] Full name display
- [ ] Badge visibility
- [ ] Mobile responsiveness (320px, 768px, 1024px+)
- [ ] Hover states
- [ ] Long content handling
- [ ] Content stress testing (long names, large numbers)

### Before/After:
- Before: [Description or screenshot]
- After: [Description or screenshot]

### Commit Message:
```
feat(ui): [brief description]

Implements: README.md#planned-changes - [specific item]
- [List of changes made]
- Follows UI_STYLING_GUIDE.md checklist
```

## 🎯 Best Practices

### Flexbox Layout
1. **Always use `gap`** instead of margins between flex items
2. **Add `min-w-0`** to containers with truncating text
3. **Use `flex-shrink-0`** sparingly, only for elements that must maintain size
4. **Combine `flex-1` with `min-w-0`** for flexible text containers

### Text Display
1. **Use `truncate`** for single-line text that might overflow
2. **Test with long content** during development
3. **Provide tooltips** for truncated text when possible
4. **Use consistent text sizing** across similar elements

### Responsive Design
1. **Mobile-first approach** - start with mobile styles
2. **Test at breakpoints** - 320px, 768px, 1024px, 1440px
3. **Use responsive utilities** - `sm:`, `md:`, `lg:`, `xl:`
4. **Avoid fixed widths** unless absolutely necessary

### Component Consistency
1. **Maintain spacing patterns** - use consistent gap/padding values
2. **Keep similar elements aligned** - same heights, widths, spacing
3. **Use design system colors** - stick to defined color palette
4. **Follow established patterns** - don't reinvent layouts

## 🔍 Quick Debug Commands

```bash
# Check for common CSS issues
grep -r "justify-between" client/src --include="*.jsx" | grep -v "gap"
grep -r "flex.*space-x" client/src --include="*.jsx"
grep -r "truncate" client/src --include="*.jsx"
```

## 🔗 Integration with Project Workflow

**README.md Integration:**
- All UI changes must reference README "Planned Changes" Active Development items
- Follow README's 5-step UI change process
- Update README if UI changes affect behavior or structure

**.cursorrules Integration:**
- UI changes trigger MANDATORY Review Checklist
- Must pass `npm run docs:drift` before and after changes
- Follow commit message format with README references

**ARCHITECTURE.md Integration:**
- Document new UI components in architecture
- Update data flow if UI changes affect API interactions

This guide should be referenced before making any styling changes to prevent regressions and ensure alignment with the project's Source-of-Truth Contract!
