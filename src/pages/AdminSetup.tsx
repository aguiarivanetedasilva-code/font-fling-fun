import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminSetup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Assign admin role via edge function or directly
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: data.user.id,
        role: "admin",
      });

      if (roleError) {
        toast.error("Conta criada, mas erro ao definir role admin: " + roleError.message);
      } else {
        toast.success("Admin criado com sucesso!");
        navigate("/admin");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-lime-400 flex items-center justify-center">
            <span className="text-gray-900 font-black text-xl">P</span>
          </div>
          <span className="text-white font-bold text-lg">Criar Admin</span>
        </div>
        <p className="text-gray-400 text-xs text-center mb-6">Crie a conta de administrador inicial</p>

        <form onSubmit={handleSetup} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-400"
            required
          />
          <input
            type="password"
            placeholder="Senha (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-400"
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-lime-400 text-gray-900 font-bold rounded-xl hover:bg-lime-300 transition-colors disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar Admin"}
          </button>
        </form>

        <p className="text-gray-500 text-xs text-center mt-4">
          Já tem conta? <a href="/admin/login" className="text-lime-400 underline">Fazer login</a>
        </p>
      </div>
    </div>
  );
};

export default AdminSetup;
