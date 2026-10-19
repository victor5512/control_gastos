//Modales para editar y eliminar 
// recibe el gasto para sincronizar los cambios con el dashboard
import { useState, useEffect } from 'react';
import api from '../services/api';

const categorias = ['Papelería', 'Transporte', 'Alimentos', 'Servicios', 'Otros'];

export default function GastoModal({ gastoAEditar, onClose, onGastoActualizado, onGastoEliminado }) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    concept: '',
    amount: '',
    dates: '',
    category: 'Transporte',
    payment_method: 'Efectivo',
    invoice: false,
  });

  //carga los datos del gasto seleccionado en el formulario de edicion
  useEffect(() => {
    if (gastoAEditar) {
      setForm({
        concept: gastoAEditar.concept || '',
        amount: gastoAEditar.amount || '',
        dates: gastoAEditar.dates || '',
        category: gastoAEditar.category || 'Transporte',
        payment_method: gastoAEditar.payment_method || 'Efectivo',
        invoice: gastoAEditar.invoice || false,
      });
    }
  }, [gastoAEditar]);

  // Actualizar Gasto (PUT /api/gastos/{id_bill})
  //envia los cambios mediante el PUT 
  const handleActualizar = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setCargando(true);
      const respuesta = await api.put(`/api/gastos/${gastoAEditar.id_bill}`, {
        ...form,
        amount: String(form.amount),
      });

      onGastoActualizado(respuesta.data); // Refresca el estado en el Dashboard
      onClose();
    } catch (err) {
      console.error('Error al actualizar:', err);
      setError(err.response?.data?.detail || 'No se pudo actualizar el gasto.');
    } finally {
      setCargando(false);
    }
  };

  // Eliminar Gasto (DELETE /api/gastos/{id_bill})
  //Eliminacion mediante DELETE y envia al dashboard
  const handleEliminar = async () => {
    setError('');
    try {
      setCargando(true);
      await api.delete(`/api/gastos/${gastoAEditar.id_bill}`);

      onGastoEliminado(gastoAEditar.id_bill); // Remueve el gasto de la lista local
      onClose();
    } catch (err) {
      console.error('Error al eliminar:', err);
      setError(err.response?.data?.detail || 'No se pudo eliminar el gasto.');
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-900">
            {confirmandoEliminar
              ? 'Confirmar eliminación'
              : isEditing
              ? 'Editar Gasto'
              : 'Detalle del Gasto'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}

        {/* VISTA DE CONFIRMACIÓN DE ELIMINACIÓN */}
        {confirmandoEliminar ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              ¿Estás seguro de que deseas eliminar el gasto <span className="font-semibold">Concepto: " {gastoAEditar.concept} " , Categoria : " {gastoAEditar.category} "</span>? Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmandoEliminar(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={cargando}
                onClick={handleEliminar}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {cargando ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        ) : !isEditing ? (
          /* VISTA DE DETALLE / ACCIONES */
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4 space-y-2 text-sm">
              <p><span className="font-semibold text-slate-500">Concepto:</span> {gastoAEditar.concept}</p>
              <p><span className="font-semibold text-slate-500">Importe:</span> \${gastoAEditar.amount}</p>
              <p><span className="font-semibold text-slate-500">Fecha:</span> {gastoAEditar.dates}</p>
              <p><span className="font-semibold text-slate-500">Categoría:</span> {gastoAEditar.category}</p>
              <p><span className="font-semibold text-slate-500">Método de pago:</span> {gastoAEditar.payment_method}</p>
              <p><span className="font-semibold text-slate-500">Deducible:</span> {gastoAEditar.deducible ? 'Sí' : 'No'}</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setConfirmandoEliminar(true)}
                className="text-sm font-semibold text-red-600 hover:underline"
              >
                Eliminar gasto
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Editar
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* VISTA DE FORMULARIO DE EDICIÓN */
          <form onSubmit={handleActualizar} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Concepto</label>
              <input
                type="text"
                required
                value={form.concept}
                onChange={(e) => setForm({ ...form, concept: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Importe (\$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Fecha</label>
                <input
                  type="date"
                  required
                  value={form.dates}
                  onChange={(e) => setForm({ ...form, dates: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Categoría</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none"
                >
                  {categorias.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Método de pago</label>
                <select
                  value={form.payment_method}
                  onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none"
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Transferencia">Transferencia</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="edit-invoice"
                checked={form.invoice}
                onChange={(e) => setForm({ ...form, invoice: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600"
              />
              <label htmlFor="edit-invoice" className="text-sm font-medium text-slate-700">
                ¿Factura?
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={cargando}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {cargando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}