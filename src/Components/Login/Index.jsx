import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Login.css';
import { useUser } from "../../Context/userContext";
import { showCustomAlert } from "../../utils/customAlert";
import bcrypt from "bcryptjs";
import Swal from "sweetalert2";

const Login = () => {
    const navigate = useNavigate();
    const [active, setActive] = useState(false);
    const [identificacion, setIdentificacion] = useState("");
    const [contraseña, setContraseña] = useState("");

    const { setUser } = useUser();

    const handleSubmit = async (e) => {
        e.preventDefault();

        let onlineFailed = false;

        try {
            const response = await fetch("http://localhost:5001/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    identificacion: Number(identificacion),
                    contraseña,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.encargado);
                localStorage.setItem("user", JSON.stringify(data.encargado));

                if (data.encargado.isAdmin) {
                    navigate("/crud-encargados");
                } else {
                    navigate("/settings");
                }

                return;
            } else {
                // 🔁 No entramos a modo offline porque sí hubo conexión.
                await showCustomAlert({
                    title: "Contraseña incorrecta",
                    text: "La contraseña ingresada no coincide.",
                    icon: "error",
                    confirmButtonText: "Aceptar"
                });
                return;
            }
        } catch (error) {
            console.warn("🛑 No se pudo conectar al servidor. Intentando login offline...");
            onlineFailed = true;
        }

        // ✅ Solo llegas aquí si falló la conexión (modo offline)
        if (onlineFailed) {
            const savedUser = localStorage.getItem("user");

            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                const identificacionMatch = parsedUser.identificacion === Number(identificacion);

                if (!identificacionMatch) {
                    await showCustomAlert({
                        title: "Usuario no encontrado",
                        text: "No se encontró ese usuario en modo offline.",
                        icon: "error",
                        confirmButtonText: "Aceptar"
                    });
                    return;
                }

                const passwordOk = await bcrypt.compare(contraseña, parsedUser.contraseña);

                if (passwordOk) {
                    setUser(parsedUser);

                    if (parsedUser.isAdmin) {
                        navigate("/home");
                    } else {
                        navigate("/home");
                    }
                } else {
                    await showCustomAlert({
                        title: "Contraseña incorrecta (modo offline)",
                        text: "La contraseña ingresada no coincide (modo offline).",
                        icon: "error",
                        confirmButtonText: "Aceptar"
                    });
                }
            } else {
                await showCustomAlert({
                    title: "Datos no encontrados",
                    text: "No hay datos guardados localmente para iniciar sesión sin conexión.",
                    icon: "warning",
                    confirmButtonText: "Aceptar"
                });
            }
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!identificacion.trim()) {
            await Swal.fire({
                icon: "warning",
                title: "Identificación requerida",
                text: "Por favor, ingresa tu número de identificación para continuar.",
                confirmButtonColor: "#1d4ed8"
            });
            return;
        }

        const { isConfirmed } = await Swal.fire({
            title: "¿Registrar Cuenta?",
            text: `¿Deseas continuar con la identificación ${identificacion}?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, continuar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#1d4ed8",
            cancelButtonColor: "#6b7280",
            customClass: {
                popup: "swal2-modern-popup",
                confirmButton: "swal2-confirm-modern",
                cancelButton: "swal2-cancel-modern",
            }
        });

        if (isConfirmed) {
            navigate(`/añadir-campos/${identificacion}`);
        }
    };


    const handleFirstTime = () => {
        navigate("/first-time");
    };

    return (
        <div className="login">
            <div className={`container ${active ? "active" : ""}`} id="container">
                {/* Sign Up */}
                <div className="form-container sign-up">
                    <form onSubmit={handleRegister}>
                        <h1>Registrar Cuenta</h1>
                        <span>Utiliza tu numero de identificación para registrarte</span>
                        <input
                            type="number"
                            className="noSpinner"
                            value={identificacion}
                            onChange={(e) => setIdentificacion(e.target.value)}
                            placeholder="Identificación"
                        />
                        <button className={`toggleBtn ${active ? "btn-right" : "btn-left"}`} type="submit">Registrar Cuenta</button>
                    </form>
                </div>

                {/* Sign In */}
                <div className="form-container sign-in">
                    <form onSubmit={handleSubmit}>
                        <h1>Iniciar Sesión</h1>
                        <span>Utiliza tu número de identificación y Contraseña</span>
                        <input
                            type="number"
                            className=" noSpinner"
                            value={identificacion}
                            onChange={(e) => setIdentificacion(e.target.value)}
                            placeholder="Identificación"
                        />
                        <input
                            type="password"
                            value={contraseña}
                            onChange={(e) => setContraseña(e.target.value)}
                            placeholder="Contraseña"
                        />
                        {/* <a href="#">¿Olvidaste tu Contraseña?</a> */}
                        <button className={`toggleBtn ${active ? "btn-right" : "btn-left"}`} type="submit">Iniciar Sesión</button>
                    </form>
                </div>

                {/* Toggle */}
                <div className="toggle-container">
                    <div className={`toggle ${active ? "toggle-right-color" : "toggle-left-color"}`}>
                        <div className="toggle-panel toggle-left">
                            <h1>Bienvenido Por Primera vez!</h1>
                            <p>Ingresa el número de identificación personal para poder registrarte</p>
                            <button
                                className={`toggleBtn ${active ? "btn-right" : "btn-left"}`}
                                id="login"
                                type="button"
                                onClick={() => setActive(false)}
                            >
                                No es mi primera vez
                            </button>
                        </div>
                        <div className="toggle-panel toggle-right">
                            <h1>Hola, Amigo!</h1>
                            <p>Ingresa con tus credenciales para utilizar todas las funciones del sitio</p>
                            <button
                                className={`toggleBtn ${active ? "btn-right" : "btn-left"}`}
                                id="register"
                                type="button"
                                onClick={() => setActive(true)}
                            >
                                Es mi primera vez
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
