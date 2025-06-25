import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { DragDropContext, Droppable, DropResult, DroppableProvided } from 'react-beautiful-dnd';
import { getWishes, createWish, updateWish, Wish } from '../api/wishes';
import useUserStore from '../store/user';
import WishCard from '../components/Wishlist/WishCard';
import { useNavigate } from 'react-router-dom'; // 1. 重新导入 useNavigate

// --- CreateWishForm 组件 (无改动) ---
type WishFormData = {
  content: string;
  note?: string;
};
const CreateWishForm: React.FC = () => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<WishFormData>();
    const createWishMutation = useMutation({
        mutationFn: createWish,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishes', 'pending'] });
            reset();
        },
        onError: (err) => { toast.error(`创建失败: ${(err as Error).message}`); }
    });
    const onSubmit = (data: WishFormData) => { createWishMutation.mutate(data); };
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="container-zelda-apple-lite p-4 rounded-xl mb-8 space-y-4 flex flex-col items-center">
            <div className="w-full max-w-1/2">
                <input {...register('content', { required: '愿望内容不能为空' })} placeholder="许下一个愿望..." className="input-zelda-apple-lite w-full" />
                {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
            </div>
            <div className="w-full max-w-1/2">
                <input {...register('note')} placeholder="备注" className="input-zelda-apple-lite w-full" />
            </div>
            <div className="flex justify-center w-full max-w-md">
                <button type="submit" className="btn-zelda-apple w-1/2" disabled={createWishMutation.isPending}>
                    {createWishMutation.isPending ? '许愿中...' : '许愿'}
                </button>
            </div>
        </form>
    );
};


// --- 主 Wishlist 组件 ---
const Wishlist: React.FC = () => {
    const queryClient = useQueryClient();
    const { user } = useUserStore();
    const navigate = useNavigate(); // 2. 实例化 navigate
    
    const pendingQueryKey = ['wishes', 'pending'] as const;
    const fulfilledQueryKey = ['wishes', 'fulfilled'] as const;

    const { data: pendingWishes = [] } = useQuery({ queryKey: pendingQueryKey, queryFn: () => getWishes('pending') });
    const { data: fulfilledWishes = [] } = useQuery({ queryKey: fulfilledQueryKey, queryFn: () => getWishes('fulfilled') });
    
    const fulfillWishMutation = useMutation({
        mutationFn: (wishId: string) => updateWish(wishId, { status: 'fulfilled' }),
        onMutate: async (wishId: string) => {
            await queryClient.cancelQueries({ queryKey: pendingQueryKey });
            await queryClient.cancelQueries({ queryKey: fulfilledQueryKey });
            const previousPending = queryClient.getQueryData<Wish[]>(pendingQueryKey) || [];
            const previousFulfilled = queryClient.getQueryData<Wish[]>(fulfilledQueryKey) || [];
            const movedWish = previousPending.find(w => w._id === wishId);
            if (!movedWish) return { previousPending, previousFulfilled };
            const newPending = previousPending.filter(w => w._id !== wishId);
            const newFulfilled = [{ ...movedWish, status: 'fulfilled', fulfilledBy: user }, ...previousFulfilled];
            queryClient.setQueryData(pendingQueryKey, newPending);
            queryClient.setQueryData(fulfilledQueryKey, newFulfilled);
            return { previousPending, previousFulfilled };
        },
        onSuccess: () => toast.success('愿望已实现! '),
        onError: (_err, _vars, context) => {
            toast.error(`实现失败`);
            if (context?.previousPending) queryClient.setQueryData(pendingQueryKey, context.previousPending);
            if (context?.previousFulfilled) queryClient.setQueryData(fulfilledQueryKey, context.previousFulfilled);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: pendingQueryKey });
            queryClient.invalidateQueries({ queryKey: fulfilledQueryKey });
        }
    });

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === 'pending' && destination.droppableId === 'fulfilled') {
            fulfillWishMutation.mutate(draggableId);
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            {/* 3. 在这里修复滚动条问题 */}
            <div className="flex flex-col min-h-screen bg-zeldaGreen/20 text-#f8f1d5 font-sheikah overflow-x-hidden">
                {/* 4. 将内边距移到这个内层 div */}
                <div className='p-8 sm:p-16 relative'>
                    {/* 5. 添加返回按钮 */}
                    <button onClick={() => navigate('/')} className="btn-zelda-square !w-14 !h-14 absolute top-8 left-8 sm:top-16 sm:left-16 z-10">
                        <div className="i-formkit-arrowleft text-2xl" />
                    </button>

                    <h1 className="title-zelda text-center mb-6">愿望清单</h1>
                    <CreateWishForm />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Droppable droppableId="pending">
                            {(provided: DroppableProvided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="bg-black/20 p-4 rounded-lg min-h-[200px]">
                                    <h2 className="text-2xl font-cinzel text-zeldaGold mb-4 text-center">待实现</h2>
                                    {pendingWishes.map((wish, index) => <WishCard key={wish._id} wish={wish} index={index} />)}
                                    {provided.placeholder}
                                    {pendingWishes.length === 0 && <p className="text-gray-500 text-center py-4">还没有愿望，快许一个吧！</p>}
                                </div>
                            )}
                        </Droppable>
                        <Droppable droppableId="fulfilled">
                            {(provided: DroppableProvided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="bg-black/20 p-4 rounded-lg min-h-[200px]">
                                    <h2 className="text-2xl font-cinzel text-zeldaGold mb-4 text-center">已实现</h2>
                                    {fulfilledWishes.map((wish, index) => <WishCard key={wish._id} wish={wish} index={index} />)}
                                    {provided.placeholder}
                                    {fulfilledWishes.length === 0 && <p className="text-gray-500 text-center py-4">这里记录着所有被实现的浪漫。</p>}
                                </div>
                            )}
                        </Droppable>
                    </div>
                </div>
            </div>
        </DragDropContext>
    );
};

export default Wishlist;
