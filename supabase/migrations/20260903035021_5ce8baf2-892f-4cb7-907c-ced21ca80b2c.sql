REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.product_stock(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.product_stock(uuid) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.redeem_topup_code(text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.redeem_topup_code(text) TO authenticated;
REVOKE ALL ON FUNCTION public.purchase_product(uuid, int) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.purchase_product(uuid, int) TO authenticated;