"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export function LoginToast() {
	const searchParams = useSearchParams();
	const router = useRouter();
    const shouldShow = searchParams.get("loggedIn") === "true";
	const [mounted, setMounted] = useState(shouldShow);
    const [visible, setVisible] = useState(false);


	useEffect(() => {
        if (!mounted) return;

		router.replace("/dashboard");

		const showTimer = setTimeout(() => setVisible(true), 10);

        const hideTimer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => setMounted(false), 300);
        }, 3000);
		return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
	}, [mounted, router]);

	if (!mounted) return null;

	return (
		<div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white text-sm font-medium px-4 py-2 rounded shadow-lgtransition-all duration-300 ${
            visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        }`}
        >
            Logged In
		</div>
	);
}
