## Dashboard Components

Dashboard views are split into two exported components: a Title and a Content.

Each view lives in [frontend/src/components/ui/Dashboard/contents](frontend/src/components/ui/Dashboard/contents) and is registered in the router map in [frontend/src/components/ui/Dashboard/dashboard.tsx](frontend/src/components/ui/Dashboard/dashboard.tsx).

### Requirements

- Export `YourDashboardTitle` and `YourDashboardContent` from a file in the contents folder.
- Title should render a single header element (ex: `h1`) and keep the class naming consistent.
- Content should render the full body layout for that dashboard view.
- Register the new components in `dashboardRoutes` so the router can animate between them.

### Example

```tsx
// frontend/src/components/ui/Dashboard/contents/MyDashboard.tsx
export function MyDashboardTitle() {
	return <h1 className="text-xl font-bold text-accent/80">My Dashboard</h1>;
}

export function MyDashboardContent() {
	return (
		<div className="dashboard-content w-full h-full flex items-center justify-center pb-4 gap-4">
			{/* your layout here */}
		</div>
	);
}
```

Then register it in the dashboard router:

```tsx
// frontend/src/components/ui/Dashboard/dashboard.tsx
import { MyDashboardTitle, MyDashboardContent } from "./contents/MyDashboard";

const dashboardRoutes = {
  main: { Title: MainDashboardTitle, Content: MainDashboardContent },
  settings: { Title: SettingsTitle, Content: SettingsContent },
  myDashboard: { Title: MyDashboardTitle, Content: MyDashboardContent },
};

```

### Navigation

Switch views by calling `setActiveDashboard("myDashboard")` and, if needed, update the hash:

```tsx
setActiveDashboard("myDashboard");
window.location.hash = "myDashboard";
``