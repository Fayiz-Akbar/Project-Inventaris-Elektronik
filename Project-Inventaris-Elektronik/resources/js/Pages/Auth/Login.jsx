// resources/js/Pages/Auth/Login.jsx
import { useEffect } from "react";
import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset("password");
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <Head title="Log in" />

            <div className="bg-white rounded-xl shadow-lg p-8 sm:p-10 w-full max-w-sm">
                <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8">
                    Login Admin
                </h2>

                {status && (
                    <div className="mb-6 px-4 py-3 bg-green-100 text-green-800 border border-green-200 rounded-lg text-center text-sm">
                        {status}
                    </div>
                )}

                <form onSubmit={submit}>
                    <div className="mb-5">
                        <InputLabel
                            htmlFor="email"
                            value="Email"
                            className="text-gray-700 font-medium text-base"
                        />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData("email", e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="mb-6">
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className="text-gray-700 font-medium text-base"
                        />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            autoComplete="current-password"
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                        />
                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="flex justify-between items-center mb-6">
                        <label className="flex items-center text-sm text-gray-600">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData("remember", e.target.checked)
                                }
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2">Ingat Saya</span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route("password.request")}
                                className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Lupa password?
                            </Link>
                        )}
                    </div>

                    <PrimaryButton
                        className="w-full justify-center py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-700 focus:ring-indigo-500 text-lg font-semibold"
                        disabled={processing}
                    >
                        MASUK
                    </PrimaryButton>
                </form>
            </div>
        </div>
    );
}
