import Button from "@/components/common/buttons/Button";
import { Navbar } from "@/components/common/Navbar/Navbar";
import { Card, CardContent, Divider, List, TextField } from "@mui/material";

type SettingItem = {
  id: string;
  title: string;
  description: string;
};

export default function Page() {
  const items: SettingItem[] = [
    { id: "account", title: "Account & Security", description: "Choose a unique password to protect your account" },
    { id: "theme", title: "Theme", description: "Appearance and theme settings" },
  ];

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-4xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1">
            <Card className="w-full max-w-lg">
              <div className="px-4 py-3">
                <h4>Settings</h4>
              </div>
              <CardContent>
                <List>
                  {items.map((item, idx) => (
                    <li className="hover:underline hover:cursor-pointer">{item.title}</li>
                  ))}
                </List>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1 md:col-span-2">
            <Card className="w-full max-w-3xl">
              <div className="px-4 py-3">
                <h3>Account & Security</h3>
              </div>
              <CardContent>
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 items-center mb-4">
                    <div className="flex-3/4">
                      <div className="font-semibold">{item.title}</div>
                      <div className="text-sm text-slate-500">{item.description}</div>
                    </div>
                    <div className="flex-1/4">
                      <div className="font-semibold hover:cursor-pointer">Change</div>
                      <div className="text-sm text-slate-500">Last Changed: N/A</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}


/*
 <div className="">
                  <TextField margin="dense" size="small" className="w-full" placeholder="Username"
                    value="password"
                    // onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <TextField margin="dense" size="small" className="w-full" placeholder="Username"
                    value="password"
                    // onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <Button
                    // disabled={isDisabled}
                    type="submit"
                    className="w-full h-8 py-5 my-2 text-white font-semibold bg-blue-700 hover:bg-blue-600">
                    Save
                  </Button>
                </div> 
*/
