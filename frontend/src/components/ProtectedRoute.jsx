
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/api";

export default function ProtectedRoute({ children }) {
  const [autorizado, setAutorizado] = useState(false);
  const [comprobando, setComprobando] = useState(true);

  useEffect(() => {
    let activo = true;
    api
      .get("/api/usuario_actual")
      .then(() => {
        if (activo) setAutorizado(true);
      })
      .catch(() => {
        if (activo) setAutorizado(false);
      })
      .finally(() => {
        if (activo) setComprobando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  if (comprobando) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Verificando sesión...
      </div>
    );
  }

  if (!autorizado) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
