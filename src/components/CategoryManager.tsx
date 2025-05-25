import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Tag, Edit2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  isDefault: boolean;
}

interface CategoryManagerProps {
  onCategoryAdded?: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ onCategoryAdded }) => {
  const { toast } = useToast();
  const [newCategory, setNewCategory] = useState('');
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  // Carregar categorias do localStorage na inicialização
  useEffect(() => {
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      // Categorias padrão
      const defaultCategories: Category[] = [
        // Receitas
        { id: '1', name: 'Salário', type: 'income', isDefault: true },
        { id: '2', name: 'Freelance', type: 'income', isDefault: true },
        { id: '3', name: 'Investimentos', type: 'income', isDefault: true },
        { id: '4', name: 'Vendas', type: 'income', isDefault: true },
        { id: '5', name: 'Outros', type: 'income', isDefault: true },
        // Despesas
        { id: '6', name: 'Alimentação', type: 'expense', isDefault: true },
        { id: '7', name: 'Transporte', type: 'expense', isDefault: true },
        { id: '8', name: 'Moradia', type: 'expense', isDefault: true },
        { id: '9', name: 'Utilidades', type: 'expense', isDefault: true },
        { id: '10', name: 'Lazer', type: 'expense', isDefault: true },
        { id: '11', name: 'Saúde', type: 'expense', isDefault: true },
        { id: '12', name: 'Educação', type: 'expense', isDefault: true },
        { id: '13', name: 'Compras', type: 'expense', isDefault: true },
        { id: '14', name: 'Outros', type: 'expense', isDefault: true }
      ];
      setCategories(defaultCategories);
      localStorage.setItem('categories', JSON.stringify(defaultCategories));
    }
  }, []);

  // Salvar categorias no localStorage sempre que houver mudanças
  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem('categories', JSON.stringify(categories));
    }
  }, [categories]);

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast({
        title: "Erro",
        description: "O nome da categoria não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se já existe uma categoria com o mesmo nome
    if (categories.some(cat => cat.name.toLowerCase() === newCategory.trim().toLowerCase() && cat.type === categoryType)) {
      toast({
        title: "Erro",
        description: "Já existe uma categoria com este nome.",
        variant: "destructive",
      });
      return;
    }

    const newCategoryObj: Category = {
      id: Date.now().toString(),
      name: newCategory.trim(),
      type: categoryType,
      isDefault: false
    };

    setCategories(prev => [...prev, newCategoryObj]);
    setNewCategory('');
    
    toast({
      title: "Sucesso",
      description: "Categoria adicionada com sucesso!",
    });

    onCategoryAdded?.();
  };

  const handleEditStart = (category: Category) => {
    setEditingCategory(category.id);
    setEditValue(category.name);
  };

  const handleEditSave = (categoryId: string) => {
    if (!editValue.trim()) {
      toast({
        title: "Erro",
        description: "O nome da categoria não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se já existe outra categoria com o mesmo nome
    const duplicateName = categories.some(
      cat => cat.id !== categoryId && 
      cat.name.toLowerCase() === editValue.trim().toLowerCase() &&
      cat.type === categoryType
    );

    if (duplicateName) {
      toast({
        title: "Erro",
        description: "Já existe uma categoria com este nome.",
        variant: "destructive",
      });
      return;
    }

    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, name: editValue.trim() } : cat
    ));
    setEditingCategory(null);
    setEditValue('');

    toast({
      title: "Sucesso",
      description: "Categoria atualizada com sucesso!",
    });
  };

  const handleEditCancel = () => {
    setEditingCategory(null);
    setEditValue('');
  };

  const handleDelete = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    
    toast({
      title: "Sucesso",
      description: "Categoria excluída com sucesso!",
    });
  };

  return (
    <Card className="dark-mode-bg backdrop-blur-lg dark-mode-border text-white">
      <CardHeader>
        <CardTitle className="dark-mode-text flex items-center">
          <Tag className="w-5 h-5 mr-2" />
          Gerenciar Categorias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={categoryType} onValueChange={(value) => setCategoryType(value as 'income' | 'expense')}>
          <TabsList className="grid w-full grid-cols-2 dark-mode-bg">
            <TabsTrigger value="income" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              Receitas
            </TabsTrigger>
            <TabsTrigger value="expense" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
              Despesas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-300">Categorias de Receita</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categories
                  .filter(cat => cat.type === 'income')
                  .map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                      {editingCategory === category.id ? (
                        <div className="flex items-center gap-2 w-full">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 h-8 dark-mode-bg dark-mode-border text-white"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditSave(category.id)}
                            className="h-8 px-2 text-green-400 hover:text-green-500"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleEditCancel}
                            className="h-8 px-2 text-red-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm text-white">{category.name}</span>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditStart(category)}
                              className="h-8 px-2 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(category.id)}
                              className="h-8 px-2 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="expense" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-300">Categorias de Despesa</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categories
                  .filter(cat => cat.type === 'expense')
                  .map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                      {editingCategory === category.id ? (
                        <div className="flex items-center gap-2 w-full">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 h-8 dark-mode-bg dark-mode-border text-white"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditSave(category.id)}
                            className="h-8 px-2 text-green-400 hover:text-green-500"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleEditCancel}
                            className="h-8 px-2 text-red-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm text-white">{category.name}</span>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditStart(category)}
                              className="h-8 px-2 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(category.id)}
                              className="h-8 px-2 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-medium text-slate-300">Adicionar Nova Categoria</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="categoryType" className="text-white">Tipo</Label>
              <Select value={categoryType} onValueChange={(value: 'income' | 'expense') => setCategoryType(value)}>
                <SelectTrigger className="dark-mode-bg dark-mode-border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="income" className="text-green-400">Receita</SelectItem>
                  <SelectItem value="expense" className="text-red-400">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="newCategory" className="text-white">Nome da Categoria</Label>
              <Input
                id="newCategory"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Ex: Entretenimento"
                className="dark-mode-bg dark-mode-border text-white placeholder:text-slate-400"
              />
            </div>

            <Button
              onClick={handleAddCategory}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Categoria
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryManager;
