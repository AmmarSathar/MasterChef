import { useEffect, useState } from "react";

import { User } from "@masterchef/shared/types/user";

export default function Login() {
    const [tempUser, setTempUser] = useState<User>();

    return (
        <>
            <div>
                <button>
                    <a href="/auth/discord" className="btn btn-primary">
                </button>
            </div>
        </>
    )
}